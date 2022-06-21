import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';
import FileUpload from '@mui/icons-material/FileUpload';

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

export default function CreateModal(props) {
  const { useState } = React;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [fileBytes, setFileBytes] = useState('');
  const [fileName, setFileName] = useState('');

  const [assetId, setAssetId] = useState('');
  const handleSetAssetId = (e) => setAssetId(e.target.value);

  const [dataspaceId, setDataspaceId] = useState('');
  const handleSetDataspaceId = (e) => setDataspaceId(e.target.value);

  const captureFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = async () => {
      const resultString = arrayBufferToString(reader.result);
      setFileBytes(resultString);
      setFileName(file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  const arrayBufferToString = (arrayBuffer) => {
    return new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
  }

  const clearFile = () => {
    setFileBytes('');
    setFileName('');
  }

  const handleCreate = () => {
    props.handleCreate(
      fileBytes, dataspaceId, assetId,
    );
    handleClose();
  }

  return (
    <div>
      <FileUpload onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Data Ingestion
          </Typography>
          <form className="login-form">
              <div className="form-field-container">
                {fileName === '' ? 
                <div>
                  <span>Choose a file</span>
                  <input 
                    id="file-input" 
                    className="file-input" 
                    type="file" 
                    onChange={captureFile} 
                    value="" 
                    autoComplete={"new-password"}
                  />
                </div>
                 :
                <div>
                  { JSON.stringify(fileName) }
                  <Typography id="modal-modal-title" variant="h5" component="h2" onClick={clearFile}>
                    x
                </Typography>
                </div>
                }
                
                <span>Asset Id</span>
                <TextField 
                    className="login-form-field" 
                    label="asset id" 
                    variant="outlined" 
                    onChange={handleSetAssetId}/>
                <span>Dataspace Id</span>
                <TextField
                    className="login-form-field" 
                    label="dataspace id" 
                    variant="outlined"
                    onChange={handleSetDataspaceId}/>
              </div>
              <Button 
                className="login-form-button" 
                variant="contained"
                color="primary"
                onClick={ handleCreate }
                > Submit
              </Button>
            </form>
        </Box>
      </Modal>
    </div>
  );
}
