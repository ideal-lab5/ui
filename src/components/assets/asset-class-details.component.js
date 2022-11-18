import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AssetClassDetailView from './asset-class-detail/asset-class-detail.component';

export default function AssetClassDetailsView(props) {

  // const history = useHistory();
  const [assetId, setAssetId] = useState('');
  const navigate = useNavigate();

  const DetailSearchButton = () => (
    <Button
      className='login-form-button btn-small'
      variant='contained'
      color='primary'
      onClick={() => {
        navigate(`/assets/${assetId}`);
      }}
    >Search
    </Button>
  );

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
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) => setAssetId(e.target.value)}/>
          </form>
          <DetailSearchButton />
          {/* <Button
            className='login-form-button btn-small'
            variant='contained'
            color='primary'
          >Search
          </Button> */}
        </div>
        {/* { doSearch === true && assetId !== '' && assetId > 0 ? 
        <AssetClassDetailView 
          account={props.account} 
          api={props.api} 
          assetId={assetId}
          emit={ props.emit } />
        : <div></div>} */}
      </div>
    </div>
    );
}
