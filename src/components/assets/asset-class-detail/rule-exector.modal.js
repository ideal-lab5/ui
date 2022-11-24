import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import TextField from '@mui/material/TextField';
import { Truncate } from '../../common/common.component';

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

export default function RuleExecutorModal(props) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    props.registerRuleExecutor(address);
    handleClose();
  };

  const handleExecuteRuleExecutor = () => {
    props.executeRuleExecutor();
    handleClose();
  }

  const [address, setAddress] = React.useState('');

  const ContractAddressConfiguration = () => {
    return (
      <div className='section'>
      <form className="login-form">
          <div className="form-field-container">
            <span>Rule Executor Contract Address</span>
            <TextField
                label="address" 
                variant="outlined"
                onChange={(e) => setAddress(e.target.value)}/>
          </div>
          <Button 
            className="login-form-button" 
            variant="contained"
            color="primary"
            onClick={ handleSubmit }
            > Submit
          </Button>
        </form>
      </div>
    );
  }

  const RequestAccess = () => {
    return (
      <div className='section'>
        {props.ruleExecutorAddress !== '' ? 
        <Button onClick={ handleExecuteRuleExecutor }>
          Purchase
        </Button>
        : <div>No rule executor defined</div> }
      </div> 
    );
  }

  return (
    <div>
      <Button onClick={handleOpen}>
      { props.ruleExecutorAddress === '' ? 
        <span>View Rule Executor Information</span> : 
        <Truncate input={ props.ruleExecutorAddress } maxLength={ 12 } copy={ false } />
      }  
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Rule Executor Info
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Asset Id: { props.assetId }
          </Typography>
          <div>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Rule Executor Address: { props.ruleExecutorAddress }
            </Typography>
            <FontAwesomeIcon
              className='copy'
              icon={faCopy}
              onClick={() => navigator.clipboard.writeText(props.ruleExecutorAddress) }
        />
          </div>
          
          { props.account === undefined || props.account === null ? <div>Loading...</div> :
              props.ruleExecutorAddress === '' ?
                props.owner !== props.account.address ?
                  <div>The data owner has not yet registered a rule exeuctor for this asset</div> 
                  : <ContractAddressConfiguration />
                : <RequestAccess />
          }
        </Box>
      </Modal>
    </div>
  );
}
