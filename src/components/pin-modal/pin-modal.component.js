import * as React from 'react';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

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

// TODO: This should be lazy loaded 
export default function PinModal(props) {
  const { useState } = React;
  const [open, setOpen] = React.useState(false);
  const [pins, setPins] = React.useState();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreatePinRequest = async (storageProviderAddress, contentAssetId) => {
    await requestLeaseStorageAsset(
      props.api,
      props.account,
      contentAssetId,
      storageProviderAddress,
      props.eventLogHandler,
      res => console.log(JSON.stringify(res)),
      err => console.error(err)
    );
  }

  useEffect(async () => {
    console.log(props.assetId);
    let res = await props.api.query.iris.pinnedContentAsset(props.assetId);
    // setPins(res);
    let pins = [];
    res.forEach(sp => {
      pins.push(sp.words[0]);
    });
    setPins(pins);
  }, []);

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
          <div className='container'>
            <span>Manage Pins</span>
            <div>

            { pins === [] || pins === undefined ? <span>Pin some data to get started</span> :
              <TableContainer component={Paper}>
                  <Table size="small" aria-label="Available Storeage Providers">
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Storage Provider Asset Id</TableCell>
                        <TableCell align="left">Manage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pins.map((item, idx) => (
                        <TableRow key={ idx }>
                          <TableCell align="left">{ item }</TableCell>
                          <TableCell align="left">
                            <Button variant="contained" color="primary" onClick={() => handleCreatePinRequest(item.owner[0], props.assetId)}>
                              Remove Pin
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            }
            </div>
          </div>
          <div>
            <span>Available Storage Providers</span>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="Available Storeage Providers">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Storage Provider</TableCell>
                      <TableCell align="left">Pin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {props.storageProviders === undefined || props.storageProviders === [] ?
                    <span>
                      No Storage Providers available
                    </span> : props.storageProviders.map((item, idx) => (
                      <TableRow key={ idx }>
                        <TableCell align="left">{ item.owner }</TableCell>
                        <TableCell align="left">
                          <Button variant="contained" color="primary" onClick={() => handleCreatePinRequest(item.owner[0], props.assetId)}>
                            Insert Pin
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
