import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AssetClassDetailView from './asset-class-detail/asset-class-detail.component';

export default function AssetClassDetailsView(props) {

  const [assetId, setAssetId] = useState('');
  const [doSearch, setDoSearch] = useState(false);

  return (
    <div className="container">
      <div className='title-container'>
          <span className='section-title'>Asset Class Details</span>
      </div>
      <div className='body'>
        <div className='section'>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Choose asset id
          </Typography>
          <form className="login-form">
            <span>Asset Id</span>
            <TextField 
              label="asset id" 
              variant="outlined" 
              onChange={(e) => setAssetId(e.target.value)}/>
          </form>
          <Button
            className='login-form-button'
            variant='contained'
            color='primary'
            onClick={() => setDoSearch(true)}
          >Search
          </Button>
        </div>
        { doSearch === true && assetId !== '' && assetId > 0 ? 
        <AssetClassDetailView api={props.api} assetId={assetId} />
        : <div></div>}
      </div>
    </div>
    );
}
