import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { query_assetClassDetails } from '../../../../services/assets.service';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ViewTokenSaleDetailsModal(props) {
  const { useState } = React;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [amount, setAmount] = useState('');
  const handleSetAmount = (e) => setAmount(e.target.value);

  const [owner, setOwner] = useState('')

  const handleSubmit = () => {
    props.purchaseTokens(props.assetId, amount);
    handleClose();
  };

  const handleQueryAssetClassDetails = async () => {
    query_assetClassDetails(props.api, props.assetId, result => {
      setOwner(result.toHuman().owner)
    });
  }

  React.useEffect(() => {
    if (props.assetId) handleQueryAssetClassDetails()
  }, []);

  return (
    <div>
      <LocalMallIcon onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Purchase Tokens
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Asset Id: { props.assetId }
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Owner: { owner }
          </Typography>
          <form className="login-form">
              <div className="form-field-container">
                <span>The number of assets to purchase</span>
                <TextField
                    className="login-form-field" 
                    label="amount" 
                    variant="outlined"
                    onChange={handleSetAmount}/>
              </div>
              <Button 
                className="login-form-button" 
                variant="contained" 
                color="primary"
                onClick={ handleSubmit }
                > Submit
              </Button>
            </form>
        </Box>
      </Modal>
    </div>
  );
}
