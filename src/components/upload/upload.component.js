import * as React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

import { encrypt } from '../../services/rpc.service';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { call_create_request, query_ingestion_staging } from '../../services/data-assets.service';
import { Button } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

export default function UploadView(props) {

  const navigate = useNavigate();

  const [fileBytes, setFileBytes] = useState('');
  const [fileName, setFileName] = useState('');

  const [CID, setCID] = useState('');
  const [multiaddress, setMultiaddress] = useState('');

  const [txSubmitted, setTxSubmitted] = useState(false);
  const [txInBlock, setTxInBlock] = useState(false);

  const [ingestionCompletionReady, setIngestionCompletionReady] = useState(false);

  const subscribe_ingestion_staging = async () => await query_ingestion_staging(
    props.api, 
    props.account, 
    result => {
      let isNotNull = JSON.stringify(result) !== 'null'
      setIngestionCompletionReady(isNotNull);
    }
  );

    useEffect(async () => {
      if (props.ipfs === null) {
        navigate('/')
      }
      // runs every 3 secs
      if (props.api && props.account !== null) {
        subscribe_ingestion_staging(); 
      }
    }, []);
    // debounce staging sub
    setInterval(subscribe_ingestion_staging, 30000);

    const handleEncryption = async ()  => {
      let plaintext = fileBytes;
      let message = 'random message'; 
      let pubkey = u8aToHex(props.account.publicKey);
      // note: This is temporary. Alice is hardcoded so that we can lazily ensure we always 
      // choose a valid proxy.
      let alicePubkey = u8aToHex(props.alice.publicKey);

      let signature = await handleSignMessage(message);
      let sig_as_hex = u8aToHex(signature);
      await encrypt(
        props.api, plaintext, sig_as_hex, pubkey, message, alicePubkey,
        async result => {
          // now add result to IPFS
          let cid = await props.ipfs.add(result);
          const id = await props.ipfs.id();
          const multiaddress = ['', 'ip4', props.ipfsHost, 'tcp', '4001', 'p2p', id.id ].join('/');
          setCID(cid.path);
          setMultiaddress(multiaddress);
          localStorage.setItem("cid", cid.path);
          localStorage.setItem("multiaddress", multiaddress);
          props.emit('Successfully encrypted and staged data.');
        },
        err => {
          props.emit('Encryption failed! Please see logs for more information.' + 
          ' The error is: ' + err);
        }
      );
    }

    /**
     * Sign the message with the configured account
     * @param {The message to sign} message 
     * @returns The signature
     */
    const handleSignMessage = async(message) => {
      // https://polkadot.js.org/docs/keyring/start/sign-verify/
      return props.account.sign(stringToU8a(message));
    }

    const captureFile = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const file = e.target.files[0];
      let reader = new FileReader();
      reader.onloadend = async () => {
        const resultString = arrayBufferToString(reader.result);
        setFileBytes(resultString);
        setFileName(file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  
    const arrayBufferToString = (arrayBuffer) => {
      return new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
    }

    const clearFile = () => {
      setFileBytes('');
      setFileName('');
    }

    const handleCreateRequest = async () => {
      let cid = CID === '' ? localStorage.getItem('cid') : CID;
      let maddr = multiaddress === '' ? localStorage.getItem('multiaddress') : multiaddress;
      setTxSubmitted(true);
      // Note: hardcoding gateway as alice node temporarily (to ensure always a valid gateway)
      await call_create_request(
        props.api, props.account, props.alice.address, cid, maddr,
        (_) => {
          props.emit('Ingestion process initiated.');
          // clear everything
          setTxInBlock(true);
          setCID('');
          setMultiaddress('');
          setFileName('');
          setFileBytes('');
          setIngestionCompletionReady(false);
        },
        (_) => {
          console.log('tx is finalized');
        }
      );
    }

    const FileUpload = () => {
      return (
        <div>
          <span>Choose a file</span>
          <input 
            id="file-input" 
            className="file-input" 
            type="file" 
            onChange={captureFile} 
            value="" 
            autoComplete={"new-password"}
          />
        </div>
      );
    }

    const SubmitFile = () => {
      return (
        <div>
          <div className='upload-result'>
          <span>{ JSON.stringify(fileName) }</span>
        </div>
        <button onClick={() => clearFile() }>
          Clear
        </button>
        <button onClick={() => handleEncryption() }>
          Continue
        </button>
      </div>
      );
    }

    const CompleteIngestion = () => {
      return (
        <div className='section'>
          <Button
            className='btn-small'
            size="small"
            variant="contained"
            onClick={handleCreateRequest}>
            Complete Upload
          </Button>
      </div>
      );
    }

    return (
        <div className="container">
          <div className='title-container'>
            <span className='section-title'>Upload</span>
          </div>
          <div className='body'>
            <div className='section'>
              { CID !== '' ? <span>CID: { CID }</span> : <span></span> }
              { multiaddress !== '' ? <span>Your IPFS multiaddress is: { multiaddress }</span> : <span></span> }
            </div>
            { txSubmitted === true && txInBlock === false ? 
              <div>
                Waiting for tx to be included in a block. This could take a few moments.
              </div> :
              ingestionCompletionReady === true && fileName !== '' && CID !== '' ? <CompleteIngestion/> : 
              fileName === '' ? <FileUpload/> : 
              CID === '' ? <SubmitFile /> : 
              <div className='section'>
                <span>Waiting for tx to be included in a block. This could take a few moments.</span>
              </div>
            }
          </div> 
        </div>
      );
}
