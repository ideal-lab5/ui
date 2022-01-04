import * as React from 'react';

import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';

import { useState, useEffect } from 'react';
import { initializeStorageCapacityAssetClass } from '../../services/iris.service';

import './storage-management.component.css';

export default function StorageManagementView(props) {

    // const [assetId, setAssetId] = useState('');
    const [candidateAssetId, setCandidateAssetId] = useState('');
    const [candidateStorageRate, setCandidateStorageRate] = useState('');
    const [candidateStorageFee, setCandidateStorageFee] = useState('');
    const [candidateEpochBlocks, setCandidateEpochBlocks] = useState('');

    useEffect(() => {

    }, []);

    const handleInitializeStorage = async() => {
      await initializeStorageCapacityAssetClass(
        props.api,
        props.account,
        candidateAssetId,
        1,
        1,
        candidateStorageFee,
        candidateStorageRate,
        candidateEpochBlocks,
        props.eventLogHandler,
        res => console.log(JSON.stringify(res)),
        err => console.error(err)
      );
    }

    return (
        <div className='storage-management-container'>
          <div>
            <span>StorageManagement</span>
          </div>
          { props.storageProviderAssetConfig === undefined || props.storageProviderAssetConfig === null ? 
            <div>
              <form className="login-form">
                <div className="form-field-container">
                  <span>Set a unique ID as your storage provider ID</span>
                  <TextField 
                    className="login-form-field" 
                    label="asset id" 
                    variant="standard"
                    type="number"
                    onChange={event => setCandidateAssetId(event.target.value)}
                  />
                  <span>Set a minimum fee required to initiate storage in OBOL</span>
                  <TextField 
                    className="login-form-field"
                    label="storage fee"
                    variant="standard" 
                    type="number"
                    onChange={event => setCandidateStorageFee(event.target.value)}
                  />
                  <span>Set your storage rate (in OBOL/kb/block)</span>
                  <TextField 
                    className="login-form-field"
                    label="storage rate"
                    variant="standard" 
                    type="number"
                    onChange={event => setCandidateStorageRate(event.target.value)}
                  />
                  <span>Set your epoch (blocks)</span>
                  <TextField 
                    className="login-form-field"
                    label="epoch blocks"
                    variant="standard" 
                    type="number"
                    onChange={event => setCandidateEpochBlocks(event.target.value)}
                  />
                </div>
                <Button
                  className="login-form-button" 
                  variant="contained" 
                  className="login-submit-btn" 
                  color="primary"
                  onClick={ handleInitializeStorage }
                  > Initialize Storage
                </Button>
              </form>
            </div> 
            :  
            <div className='asset-config-container'>
              <span>Storage Provider Id: { props.storageProviderAssetConfig.storageAssetId.words[0] }</span>
              <span>Storage Fee: { props.storageProviderAssetConfig.storageFee.words[0] }</span>
              <span>Storage Rate: { props.storageProviderAssetConfig.storageRate.words[0] }</span>
              <span>Epoch Blocks: { props.storageProviderAssetConfig.storageEpochBlocks.words[0] }</span>
            </div>}
          </div>
      );
}
