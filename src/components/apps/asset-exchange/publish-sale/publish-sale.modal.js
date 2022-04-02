import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';
import StorefrontIcon from '@mui/icons-material/Storefront';

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

export default function PublishSaleModal(props) {
  const { useState } = React;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [amount, setAmount] = useState('');
  const handleSetAmount = (e) => setAmount(e.target.value);

  const [price, setPrice] = useState('');
  const handleSetPrice = (e) => setPrice(e.target.value);

  const handleSubmit = () => {
    props.publishTokenSale(props.assetId[0], amount, price);
    handleClose();
  };

  return (
    <div>
      <StorefrontIcon onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Publish Token Sale
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Asset Id: { props.assetId }
          </Typography>
          <form className="login-form">
              <div className="form-field-container">
                <span>The number of assets to mint</span>
                <TextField
                    className="login-form-field" 
                    label="amount" 
                    variant="outlined"
                    onChange={handleSetAmount}/>
                <span>The asset sale price</span>
                <TextField
                    className="login-form-field" 
                    label="price" 
                    variant="outlined"
                    onChange={handleSetPrice}/>
              </div>
              <Button 
                className="login-form-button" 
                variant="contained" 
                // className="login-submit-btn" 
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
