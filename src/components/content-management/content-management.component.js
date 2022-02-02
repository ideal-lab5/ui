import * as React from 'react';
import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import MintModal from '../mint-modal/mint-modal.component';

import { call_create, call_mint, query_AssetClassOwnership_by_AccountId } from '../../services/iris-assets.service';

export default function ContentManagementView(props) {

    // const useState = React;
    const [assetClasses, setAssetClasses] = useState([]);

    const handleLoadAssetClasses = async () => {
      if (props.api === null) {
        console.log('props are not yet loaded');
      } else {
        await query_AssetClassOwnership_by_AccountId(props.api, props.account.address,
          res => {
            let yourAssetClasses = [];
            res.forEach(([key, exposure]) => {
              let cid = exposure.toHuman()
              let asset_id = parseInt(key.args[1].words[0]);
              yourAssetClasses.push({
                cid: cid,
                assetId: asset_id,
              });
            });
            setAssetClasses(yourAssetClasses);
          },
          err => {
            console.error(err);
          });
      }
    }

    useEffect(() => {
        handleLoadAssetClasses();
    }, []);

    const handleMint = async (beneficiary, cid, amount) => {
      await call_mint(
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
        await call_create(
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
          { assetClasses.length === 0 ? 
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetClasses.map((item, idx) => (
                    <TableRow key={ idx }>
                      <TableCell align="right">{ item.assetId  }</TableCell>
                      <TableCell align="right">{ item.cid }</TableCell>
                      <TableCell align="right">
                        <MintModal
                          assetId={ item.assetId } 
                          cid={ item.cid }
                          mint={ handleMint } 
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
