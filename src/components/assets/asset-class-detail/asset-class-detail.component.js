import { Button, TextField } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { query_assetClassDetails } from '../../../services/assets.service';
import { query_metadata } from '../../../services/data-assets.service';
import { call_registerRule, call_ruleExecutor, query_registry } from '../../../services/authorization.service';
import { ContractPromise } from '@polkadot/api-contract';
import RuleExecutorModal from './rule-exector.modal';

import { stringToU8a, u8aToHex, hexToU8a } from '@polkadot/util'

import contractMetadata from '../../../resources/metadata.json';
import { query_CapsuleFragments, query_ReencryptionArtifacts } from '../../../services/iris-proxy.service';
import { useParams } from 'react-router-dom';
import { decrypt } from '../../../services/rpc.service';

import { CID as CIDType } from 'ipfs-http-client';
import { saveAs } from 'file-saver';

export default function AssetClassDetailView(props) {

  let { assetId } = useParams();

  const [CID, setCID] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [ruleExecutorAddress, setRuleExecutorAddress] = useState('');
  const [assetDetails, setAssetDetails] = useState({});

  const [reencryptionReady, setReencryptionReady] = useState(false);
  const [decryptionReady, setDecryptionReady] = useState(false);

  useEffect(() => {
    if  (props.api !== null) {
      queryMetadata();
      queryAssetClassDetails();
      queryRuleExecutor();
    }
  }, []);

  const queryMetadata = async () => {
    // clear existing values
    setCID('');
    setPublicKey('');
    console.log("Query metadata for asset id " + assetId);
    await query_metadata(
      props.api, assetId, async result => {
        if (result !== null && result.toHuman() !== null) {
          let publicKey = result.toHuman().publicKey;
          setCID(result.toHuman().cid);
          setPublicKey(publicKey);
          await queryReencryptionArtifacts(publicKey);
          await queryCapsuleFragments(publicKey);
        }
      });
  }

  const queryReencryptionArtifacts = async(publicKey) => {
    await query_ReencryptionArtifacts(props.api, props.account, publicKey,
      result => {
        console.log("reencryption artifacts query results");
        console.log(result.toHuman());
        // this condition may not be sufficient for all conditions
        setReencryptionReady(result !== null && result.verifyingKey !== null);
      });
  }

  const queryCapsuleFragments = async(publicKey) => {
    await query_CapsuleFragments(props.api, props.account, publicKey,
      result => {
        console.log("capsule fragment query results");
        console.log(result.toHuman());
        setDecryptionReady(result !== null && result.length > 0);
      });
  }

  const queryAssetClassDetails = async () => {
    // destroy preexisting values
    setRuleExecutorAddress('');
    setAssetDetails({});
    await query_assetClassDetails(
      props.api, assetId, result => {
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
    await query_registry(props.api, assetId, result => {
      let readableResult = result.toHuman();
      if (readableResult !== null) {
        setRuleExecutorAddress(readableResult)
      }
    })
  }

  const registerRuleExecutor = async(assetId, contractAddress) => {
    console.log('called register rule exeuctor');
    await call_registerRule(props.api, props.account, contractAddress, assetId, 
      result => {
        if (result.status.isInBlock) {
          props.emit('New rule executor is registered with your asset id successfully!');
        }
      });
  }

  const executeRuleExecutor = async() => {
    const contract = new ContractPromise(
      props.api, contractMetadata, props.account.address
    );
    const gasLimit = 1000000000;
    const value = props.api.registry.createType('Balance', 5000);
    const tweetnacl = require('tweetnacl');
    let keyPair = tweetnacl.box.keyPair();
    console.log(u8aToHex(keyPair.publicKey));
    // console.log(u8aToHex(keyPair.secretKey));
    localStorage.setItem('secretKey', u8aToHex(keyPair.secretKey));
    await call_ruleExecutor(
      contract, props.account, value, gasLimit, assetId, keyPair.publicKey,
      result => {
        // TODO: should probably indicate something?
        props.emit("Rule executor execution complete.");
        console.log(u8aToHex(result.txHash));
      },
      err => {
        console.log(err);
      }
    );
  }

  const handleDecrypt = async () => {
    if (props.account !== null) {
      // 1. fetch ciphertext from IPFS
      // await props.ipfs.get(CIDType.parse(CID));
      // let ciphertext = await props.ipfs.cat(CIDType.parse(CID));
      let ciphertext = [];
      for await (const val of props.ipfs.cat(CIDType.parse(CID))) {
        ciphertext.push(val);
      }
      props.verifyCiphertext(ciphertext[0]);
      console.log(ciphertext[0]);
      // 2. sign message
      let message = 'random message'; 
      let pubkey = u8aToHex(props.account.publicKey);
      let signature = await props.account.sign(stringToU8a(message))
      let sig_as_hex = u8aToHex(signature);
      // 3. fetch secret key
      let secretKey = localStorage.getItem('secretKey');
      console.log("DECRYPTING FOR ASSET ID " + assetId);
      await decrypt(
        props.api, sig_as_hex, pubkey, message, u8aToHex(ciphertext[0]), assetId, secretKey,
        res => {
          console.log(res);
          download(res, assetId);
        }, err => {
          console.log(err);
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

  return (
    <div className='container'>
      <div className='title-container'>
        <span className='section-title'>Asset Details</span>
      </div>
      <div className='body'>
        <div className='section'>
          {assetDetails.owner === undefined ? 
          <div className='section'>
            <span>No asset class found with id { assetId }</span>
          </div> :
          <div className='section'>
            <span>CID: {CID}</span>
            <span>Public Key: {publicKey}</span>
            <span>Owner: {assetDetails.owner}</span>
            <span>Supply: {assetDetails.supply}</span>
            <RuleExecutorModal
              account={ props.account }
              api={ props.api }
              assetId={ assetId }
              ruleExecutorAddress={ ruleExecutorAddress }
              owner={ assetDetails.owner }
              registerRuleExecutor= { registerRuleExecutor }
              executeRuleExecutor={ executeRuleExecutor }
            />
            { 
              reencryptionReady === true && decryptionReady === true ? 
                <Decrypt /> :
                <div>
                  <span>Execute rule executor to access this content.</span>
                </div>
            }
          </div>
        }
        </div>
      </div>
    </div>
  );
}
