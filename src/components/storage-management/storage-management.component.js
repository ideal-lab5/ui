import * as React from 'react';

import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';

import { useState, useEffect } from 'react';
import { initializeStorageCapacityAssetClass } from '../../services/iris.service';

export default function StorageManagementView(props) {

    // const [assetId, setAssetId] = useState('');
    const [candidateAssetId, setCandidateAssetId] = useState('');

    // useEffect(() => {
    //   if (!assetId) {
    //       queryStorageConfig();
    //   }
    // }, []);

    // const queryStorageConfig = async () => {
    //   let res = await props.getSpAssetID();
    //   setAssetId(res);
    // }

    const handleInitializeStorage = async() => {
      await initializeStorageCapacityAssetClass(
        props.api,
        props.account,
        candidateAssetId,
        1,
        1,
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
          { props.storageProviderAssetId === undefined || props.storageProviderAssetId === 0 ? 
            <div>
              <form className="login-form">
                <div className="form-field-container">
                  <span>Set a unique ID as your storage provider ID</span>
                  <TextField 
                    className="login-form-field" 
                    label="asset id" 
                    variant="outlined" 
                    onChange={event => setCandidateAssetId(event.target.value)}
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
            <div>
              <span>Storage Provider Id: { props.storageProviderAssetId }</span>
              <div>
                <span>Storage Requests/Pending Approvals</span>         
              </div>
            </div>}
          </div>
      );
}
