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

export default function LibraryView(props) {

    const [assets, setAssets] = useState([]);
    
    const unsub_assetAccess = async() => await query_AssetAccess_by_AccountId(
      props.api,
      props.account.address,
      assetAccess => {
        console.log(assetAccess);
        let yourAssets = [];
        assetAccess.forEach(([key, exposure]) => {
          let assetId = parseInt(key.args[1].words[0]);
          let assetClassOwner = exposure.toHuman();
          yourAssets.push({
            assetId: assetId,
            assetClassOwner: assetClassOwner,
          });
        });

        setAssets(yourAssets);
      }
    );

    useEffect(() => {
      unsub_assetAccess();
    }, []);

    const handleRequestData = (owner, asset_id) => {
      // fetch CID from runtime storage
      call_requestBytes(
        props.api,
        props.account,
        owner,
        asset_id,
        props.eventLogHandler,
        res => console.log("submitted request successfully"),
        err => console.error(err)
      );
    }

    const handleRpcCall = (asset_id) => {
      query_Metadata_by_AssetId(
        props.api, asset_id,
        cid => {
          let _cid = hexToAscii(String(cid).substring(2));
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
      const mime = require('mime-types');
      const type = mime.lookup(filename);
      const blob = new Blob([file], {type: type});
      saveAs(blob, filename);
    }

    return (
        <div>
          <div>
            <span>Library</span>
          </div>
          <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Owner</TableCell>
                    <TableCell align="right">Asset ID</TableCell>
                    <TableCell align="right">Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((item, idx) => (
                    <TableRow key={ idx } >
                      <TableCell align="right">{ item.assetClassOwner  }</TableCell>
                      <TableCell align="right">{ item.assetId }</TableCell>
                      <TableCell align="right">
                        <button onClick={() => handleRequestData(item.assetClassOwner, item.assetId)}>
                          Request
                        </button>
                        <button onClick={() => handleRpcCall(item.assetId)}>
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
