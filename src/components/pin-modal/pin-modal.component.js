import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import TextField from '@mui/material/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import PushPinIcon from '@mui/icons-material/PushPin';
import { requestLeaseStorageAsset } from '../../services/iris.service';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function PinModal(props) {
  const { useState } = React;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreatePinRequest = async (storageProviderAddress, storageProviderAssetId) => {
    await requestLeaseStorageAsset(
      props.api,
      props.account,
      storageProviderAssetId,
      storageProviderAddress,
      props.eventLogHandler,
      res => console.log(JSON.stringify(res)),
      err => console.error(err)
    );
  }

  return (
    <div>
      <PushPinIcon onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Pin Content
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Asset Id: { props.assetId }
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            { props.cid }
          </Typography>
          <div>
            <span>Available Storage Providers</span>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Storage Provider</TableCell>
                      <TableCell align="right">Pin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {props.storageProviders === undefined || props.storageProviders === [] ?
                    <span>
                      No Storage Providers available
                    </span> : props.storageProviders.map((item, idx) => (
                      <TableRow key={ idx }>
                        <TableCell align="left">{ item.owner }</TableCell>
                        <TableCell align="right">
                          <Button variant="contained" color="primary" onClick={() => handleCreatePinRequest(item.owner[0], item.assetId)}>
                            Store Data
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
