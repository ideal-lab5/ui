import { Button } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { query_assetClassDetails } from '../../../services/assets.service';
import { query_metadata } from '../../../services/data-assets.service';
import { call_registerRule, query_registry } from '../../../services/authorization.service';
import RuleExecutorModal from './rule-exector.modal';

import { stringToU8a, u8aToHex } from '@polkadot/util'

import { query_CapsuleFragments, query_ReencryptionArtifacts } from '../../../services/iris-proxy.service';
import { decrypt } from '../../../services/rpc.service';

import { CID as CIDType } from 'ipfs-http-client';
import { saveAs } from 'file-saver';

import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import TableRow from '@mui/material/TableRow';
import { Truncate } from '../../common/common.component';
import contractMetadata from '../../../resources/metadata.json';
import { ContractPromise } from '@polkadot/api-contract';

export default function AssetClassDetailView(props) {

  const [CID, setCID] = useState('');
  const [ruleExecutorAddress, setRuleExecutorAddress] = useState('');
  const [assetDetails, setAssetDetails] = useState({});

  const [decryptionPK, setDecryptionPK] = useState('');
  const [isWaitingForContract, setIsWaitingForContract] = useState(false);
  const [reencryptionReady, setReencryptionReady] = useState(false);
  const [decryptionReady, setDecryptionReady] = useState(false);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect(() => {
    if (props.api !== null) {
      queryMetadata();
      queryAssetClassDetails();
      queryRuleExecutor();
    }
  }, []);

  const queryMetadata = async () => {
    // clear existing values
    setCID('');
    await query_metadata(
      props.api, props.assetId, async result => {
        if (result !== null && result.toHuman() !== null) {
          let publicKey = result.toHuman().publicKey;
          setCID(result.toHuman().cid);
          await queryReencryptionArtifacts(publicKey);
          await queryCapsuleFragments(publicKey);
        }
      });
  }

  const queryReencryptionArtifacts = async(publicKey) => {
    await query_ReencryptionArtifacts(props.api, props.account, publicKey,
      result => {
        if (result !== null && result.verifyingKey !== null) {
          setReencryptionReady(true);
        }

      });
  }

  const queryCapsuleFragments = async(publicKey) => {
    await query_CapsuleFragments(props.api, props.account, publicKey,
      result => {
        if (result !== null && result.length > 0) {
          setDecryptionReady(true);
          setIsWaitingForContract(false);
        }
      });
  }

  const queryAssetClassDetails = async () => {
    // clear preexisting values
    setRuleExecutorAddress('');
    setAssetDetails({});
    await query_assetClassDetails(
      props.api, props.assetId, result => {
        let res = result.toHuman();
        if (res !== null) {
          setAssetDetails({
            owner: res.owner,
            admin: res.admin,
            supply: res.supply,
            deposit: res.deposit,
            minBalance: res.minBalance,
          });
        }
      }
    );
  }

  const queryRuleExecutor = async() => {
    await query_registry(props.api, props.assetId, result => {
      let readableResult = result.toHuman();
      if (readableResult !== null) {
        setRuleExecutorAddress(readableResult)
      }
    })
  }

  const registerRuleExecutor = async(contractAddress) => {
    await call_registerRule(props.api, props.account, contractAddress, props.assetId, 
      result => {
        if (result.status.isInBlock) {
          setRuleExecutorAddress(contractAddress);
          props.emit('New rule executor is registered with your asset id successfully!');
        }
      });
  }

  const handleGenerateKeys = async() => {
    const tweetnacl = require('tweetnacl');
    let keyPair = tweetnacl.box.keyPair();
    let key = 'secretKey:' + props.account.address + ':' + props.assetId ;
    let pk = u8aToHex(keyPair.publicKey);
    let sk = u8aToHex(keyPair.secretKey);
    localStorage.setItem(key, sk);

    setDecryptionPK(pk);
    // get the contract promise
    let contract = new ContractPromise(props.api, contractMetadata, ruleExecutorAddress);
    const gasLimit = 3000n * 100000000n;
    const storageDepositLimit = null;
    setIsWaitingForContract(true);
    await contract.tx.execute({gasLimit, storageDepositLimit}, props.assetId, pk)
      .signAndSend(props.account, result => {
        console.log(result);
        // if (result.status.isInBlock) {
        //   props.emit('Contract execution successful');
        // }
    });
    // try fetch the CID here so we don't have to wait later on
    await props.ipfs.get(CIDType.parse(CID));
  }

  const handleDecrypt = async () => {
    if (props.account !== null) {
      // 1. fetch ciphertext from IPFS
      let ciphertext = [];
      for await (const val of props.ipfs.cat(CIDType.parse(CID))) {
        ciphertext.push(val);
      }
      // 2. sign message
      let message = 'random message'; 
      let pubkey = u8aToHex(props.account.publicKey);
      let signature = await props.account.sign(stringToU8a(message))
      let sig_as_hex = u8aToHex(signature);
      // 3. fetch secret key
      let secretKey = localStorage.getItem('secretKey:' + props.account.address + ':' + props.assetId);
      await decrypt(
        props.api, sig_as_hex, pubkey, message, u8aToHex(ciphertext[0]), props.assetId, secretKey,
        res => {
          props.emit('Download initiated');
          download(res, CID);
        }, err => {
          console.log(err);
          props.emit(err.toString());
        }
      );
    }
  }

  const download = (file, filename) => {
    const blob = new Blob([file]);
    saveAs(blob, filename);
  }

  const Decrypt = () => {
    return (
      <div className='section'>
        <Button
        onClick={handleDecrypt}
        >Decrypt and Download</Button>
      </div>
    );
  }
  // https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/contracts
  return (
    <StyledTableRow key={ props.assetId }>
      <StyledTableCell component="th" scope="row">{ props.assetId }</StyledTableCell>
      <StyledTableCell align="right"><Truncate input={ CID } maxLength={ 12 } /></StyledTableCell>
      <StyledTableCell align="right"><Truncate input={ assetDetails.owner } maxLength = {12} /></StyledTableCell>
      <StyledTableCell align="right">
        <RuleExecutorModal
          account={ props.account }
          api={ props.api }
          assetId={ props.assetId }
          ruleExecutorAddress={ ruleExecutorAddress }
          owner={ assetDetails.owner }
          registerRuleExecutor={ registerRuleExecutor }
      />
      </StyledTableCell>
      <StyledTableCell align="right">
      { 
        reencryptionReady === true && decryptionReady === true ? 
          <Decrypt /> :
          <div>
            { isWaitingForContract === false ? 
              <button
                disabled={ruleExecutorAddress === ''}
                onClick={ handleGenerateKeys }
              >Request decryption
              </button> :
              <div className='section'>
                <span>Awaiting Reencryption</span>
                <span>public key: <Truncate input={ decryptionPK } maxLength={ 12 } /></span>
              </div>
            }
          </div>
      }
      </StyledTableCell>
    </StyledTableRow>
  );
}
