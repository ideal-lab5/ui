import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { saveAs } from 'file-saver';

import MintModal from '../mint-modal/mint-modal.component';
import { createStorageAsset, mintTickets } from '../../services/iris.service';

export default function StorageAssetView(props) {

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
        await handleAddBytes(resultString);
      };
      reader.readAsArrayBuffer(file);
    }
  
    const handleAddBytes = async (bytes) => {
      const res = await props.ipfs.add(bytes);
      const id = await props.ipfs.id();
      // TODO: how can I inject the proper ip here? there's a lib I think
      const multiAddress = ['', 'ip4', '192.168.1.170', 'tcp', '4001', 'p2p', id.id ].join('/');
      const asset_id = Math.floor(Math.random()*1000);
      await createStorageAsset(
        props.api, 
        props.account,
        multiAddress, 
        res.path, 
        asset_id, 
        1,
        props.handleEventLogs, 
        res => console.log(JSON.stringify(res)), 
        err => console.error(err));
    }
    
  //   const download = (file, filename) => {
  //     const mime = require('mime-types');
  //     const type = mime.lookup(filename);
  //     const blob = new Blob([file], {type: type});
  //     saveAs(blob, filename);
  // }
  
    const arrayBufferToString = (arrayBuffer) => {
      return new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
    }  

    return (
        <div className="container">
          <div>
            <span>Your Storage Assets</span>
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
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Asset Id</TableCell>
                  <TableCell align="right">CID</TableCell>
                  <TableCell align="right">Mint</TableCell>
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
                        mint={handleMintTicket} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
}
