import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';

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

export default function RuleExecutorRegistryModal(props) {
    const { useState } = React;
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [ruleAddress, setRuleAddress] = useState('');


    const handleRegisterRule = (e) => {
      props.registerRule(props.assetId, ruleAddress);
      handleClose();
    };

  return (
    <div>
      <AddIcon onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Register Rule Executor for {props.assetId}
          </Typography>
          <form className="login-form">
              <div className="form-field-container">
                <span>Rule Executor Address</span>
                <TextField 
                    className="login-form-field" 
                    label="rule executor address" 
                    variant="outlined" 
                    onChange={(e) => setRuleAddress(e.target.value)}/>
              </div>
              <Button 
                className="login-form-button" 
                variant="contained"
                color="primary"
                onClick={ handleRegisterRule }
                > Submit
              </Button>
            </form>
        </Box>
      </Modal>
    </div>
  );
}
