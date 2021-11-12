import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function MintModal(props) {
    const { useState } = React;
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [recipientAddress, setRecipientAddress] = useState('');
    const handleSetRecipientAddress = (e) => setRecipientAddress(e.target.value);

    const [amount, setAmount] = useState('');
    const handleSetAmount = (e) => setAmount(e.target.value);

    const handleOnClick = (e) => {
      props.onSubmit(recipientAddress, props.cid, amount);
      handleClose();
    };

  return (
    <div>
      <Button onClick={handleOpen}>Go</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Mint assets 
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Asset Id: { props.assetId }
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 1 }}>
            { props.cid }
          </Typography>
          <form className="login-form">
              <div className="form-field-container">
                <span>The receipient's address</span>
                <TextField 
                    className="login-form-field" 
                    label="address" 
                    variant="outlined" 
                    onChange={handleSetRecipientAddress}/>
                <span>The number of assets to mint</span>
                <TextField
                    className="login-form-field" 
                    label="amount" 
                    variant="outlined"
                    onChange={handleSetAmount}/>
              </div>
              <Button 
                className="login-form-button" 
                variant="contained" 
                className="login-submit-btn" 
                color="primary"
                onClick={ handleOnClick }
                > Submit
              </Button>
            </form>
        </Box>
      </Modal>
    </div>
  );
}
