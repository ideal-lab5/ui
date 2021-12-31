import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import MintModal from '../mint-modal/mint-modal.component';

import { createStorageAsset, mintTickets } from '../../services/iris.service';
import PinModal from '../pin-modal/pin-modal.component';

export default function ContentManagementView(props) {

    const handleMintTicket = async (beneficiary, cid, amount) => {
      await mintTickets(
        props.api,
        props.account,
        beneficiary,
        cid,
        amount,
        props.handleEventLogs, 
        res => console.log(JSON.stringify(res)), 
        err => console.error(err));
    };

    const captureFile = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const file = e.target.files[0];
      let reader = new FileReader();
      reader.onloadend = async () => {
        const resultString = arrayBufferToString(reader.result);
        await handleAddBytes(resultString, file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  
    const handleAddBytes = async (bytes, name) => {
      const res = await props.ipfs.add(bytes);
      const ipv4 = process.env.REACT_APP_IPV4;
      if (ipv4 === undefined) {
        console.error("Please provide the REACT_APP_IPV4 environment variable to use this functionality.");
      } else {
        const id = await props.ipfs.id();
        const multiAddress = ['', 'ip4', ipv4, 'tcp', '4001', 'p2p', id.id ].join('/');
        const asset_id = Math.floor(Math.random()*1000);
        await createStorageAsset(
          props.api, 
          props.account,
          multiAddress, 
          res.path,
          name,
          asset_id,
          1,
          props.eventLogHandler, 
          res => console.log(JSON.stringify(res)), 
          err => console.error(err)
        );
      }
    }
  
    const arrayBufferToString = (arrayBuffer) => {
      return new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
    }  

    return (
        <div className="container">
          <div>
            <span>Content Management</span>
          </div>
          <div>
            <input 
              id="file-input" 
              className="file-input" 
              type="file" 
              onChange={captureFile} 
              value="" 
              autoComplete={"new-password"}
            />
          </div>
          { props.storageAssetClasses.length === 0 ? 
            <span>
              No owned content. Upload some data to get started.
            </span>
          : 
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Asset Id</TableCell>
                    <TableCell align="right">CID</TableCell>
                    <TableCell align="right">Mint</TableCell>
                    <TableCell align="right">Manage Pins</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.storageAssetClasses.map((item, idx) => (
                    <TableRow key={ idx }>
                      <TableCell align="right">{ item.assetId  }</TableCell>
                      <TableCell align="right">{ item.cid }</TableCell>
                      <TableCell align="right">
                        <MintModal
                          assetId={ item.assetId } 
                          cid={ item.cid }
                          mint={ handleMintTicket } 
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <PinModal
                          api={ props.api }
                          account={ props.account }
                          assetId={ item.assetId } 
                          cid={ item.cid }
                          storageProviders={ props.storageProviders }
                          eventLogHandler={ props.eventLogHandler }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          }
        </div>
      );
}
