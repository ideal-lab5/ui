import * as React from 'react';
import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { hexToAscii } from '../../util/utils';
import { 
  call_requestBytes, 
  rpc_retrieveBytes, 
  query_AssetAccess_by_AccountId, 
  query_Metadata_by_AssetId
} from '../../services/iris-assets.service';
import { saveAs } from 'file-saver';
import { query_assetClassDetails } from '../../services/assets.service';

export default function LibraryView(props) {

    const [assets, setAssets] = useState([]);
    
    const unsub_assetAccess = async() => await query_AssetAccess_by_AccountId(
      props.api, props.account.address,
      assetAccess => {
        setAssets(assetAccess.toHuman());
      }
    );

    useEffect(() => {
      unsub_assetAccess();
    }, []);

    const handleRequestData = (assetId) => {
        call_requestBytes(
          props.api,
          props.account,
          assetId,
          result => {
            props.emit('Data request initiated for asset with id ' + assetId);
          }, result => {
            props.emit('Data ready for asset with id ' + assetId);
          }
        );
    }

    const handleRpcCall = (assetId) => {
      query_Metadata_by_AssetId(
        props.api, assetId,
        cid => {
          let _cid = hexToAscii(String(cid));
          console.log("Found CID " + _cid);
          rpc_retrieveBytes(props.api, _cid,
            res => { 
              console.log(JSON.stringify(res));
              download(res, _cid);
            },
            err => console.error(err));
        },
        err => console.error(err)
    )}

    const download = (file, filename) => {
      // const mime = require('mime-types');
      // const type = mime.lookup(filename);
      // const blob = new Blob([file], {type: type});
      const blob = new Blob([file]);
      saveAs(blob, filename);
    }

    return (
        <div className='container'>
          <div className='title-container'>
            <span className='section-title'>Library</span>
          </div>
          <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    {/* <TableCell align="right">Owner</TableCell> */}
                    <TableCell align="right">Asset ID</TableCell>
                    <TableCell align="right">Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((item, idx) => (
                    <TableRow key={ idx } >
                      {/* <TableCell align="right">{ item.assetClassOwner  }</TableCell> */}
                      <TableCell align="right">{ item }</TableCell>
                      <TableCell align="right">
                        <button onClick={() => handleRequestData(item)}>
                          Request
                        </button>
                        <button onClick={() => handleRpcCall(item)}>
                          Download
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
      );
}
