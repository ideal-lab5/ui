import { Button, TextField } from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { call_mint_dataspace_access, create_dataspace, query_metadata } from '../../services/data-spaces.service';

import DataSpaceCreateModal from './data-spaces.modal';
import './data-spaces.component.css';
import { query_account, query_assetClassDetails } from '../../services/assets.service';
import DataspaceMintModal from './dataspace-mint-modal.component';

export default function DataSpacesView(props) {

  const [queryAssetId, setQueryAssetId] = useState(0);
  const [assetId, setAssetId] = useState(0);
  const [owner, setOwner] = useState('');
  const [balance, setBalance] = useState(0);
  const [dataspace, setDataspace] = useState({
    name: '',
    assetIds: []
  });

  const [showError, setShowError] = useState(false);

  const queryDataSpace = async () => {
    await query_metadata(
      props.api, queryAssetId,
      dataspacesRaw => {
        let readableDataspace = dataspacesRaw.toHuman();
        if (readableDataspace === null) {
          setShowError(true);
        } else {
          setAssetId(queryAssetId);
          setDataspace({
            name: readableDataspace.name,
            assetIds: readableDataspace.assetIds,
          });
          handleCheckOwner(queryAssetId);
          handleCheckBalance(queryAssetId);
        }
      }
    );
  }

  const handleCreate = async (id, name) => {
    await create_dataspace(
      props.api, props.account, id, name, 1,
      result => {
        props.emit('DataSpaces: created data space with id: ' + id + ' and name ' + name + ': in block');
      }, result => {
        props.emit('DataSpaces: created data space with id: ' + id + ' and name ' + name + ': finalized');
      },
    );
  }

  const handleMint = async (beneficiary, asset_id, amount) => {
    await call_mint_dataspace_access(
      props.api, props.account, beneficiary, asset_id, amount,
      result => {
        props.emit('Mint: ' + amount + ' assets with id ' + asset_id + ': in block');
      }, result => {
        props.emit('Mint: ' + amount + ' assets with id ' + asset_id + ': finalized');
      },
    );
  };

  const handleCheckOwner = async (assetId) => {
    query_assetClassDetails(props.api, assetId, result => {
      let readableResult = result.toHuman();
      if (readableResult !== null) {
        setOwner(result.toHuman().owner) 
      }
    });
  }

  const handleCheckBalance = async (assetId) => {
    query_account(props.api, props.account, assetId, result => {
      let readableAccount = result.toHuman();
      if (readableAccount !== null) {
        setBalance(readableAccount.balance)
      }
    })
  }

  return (
    <div className="container">
      <div className='title-container'>
        <span className='section-title'>Data Spaces</span>
      </div>
      <div className='dataspace-create-container'>
        Create new dataspace
        <DataSpaceCreateModal
          create={ handleCreate }
        />
      </div>
      <div>
        <form className="login-form">
          <div className="form-field-container">
            <TextField 
              className="login-form-field" 
              label="dataspace id" 
              variant="outlined" 
              value={ queryAssetId } 
              onChange={ (e) => setQueryAssetId(e.target.value)  }
            />
          </div>
          <Button
            className="login-form-button login-submit-btn" 
            variant="contained"
            color="primary" 
            onClick={ queryDataSpace.bind(this) } 
          > Query 
          </Button>
        </form> 
      </div>
      { dataspace.name === '' ? 
        showError === true ? <div>Invalid dataspace id</div> : <div></div> :
        <div>
          <span>
            Dataspace Query Results for dataspace id: {assetId}
          </span>
          <div className='dataspace-query-results'>
            <span>Name: {dataspace.name}</span>
            <span>AssetIds: {
              dataspace.assetIds.len === 0 ? 'there are no assets associated with this dataspace' :
                dataspace.assetIds
            }</span>
            <span>Balance: {balance}</span> 
            <div>
              <span>{owner}</span>
              { owner === props.account.address ? 
              <div>
                <span>
                  Mint Datspace access
                </span>
                <DataspaceMintModal
                  assetId={assetId}
                  mint={ handleMint }
                />
              </div> :
                <div></div>
              }
            </div>
            
          </div>
        </div>
      }
    </div>
  );
}
