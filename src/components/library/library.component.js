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
import { call_requestBytes, rpc_retrieveBytes, query_AssetAccess_by_AccountId, query_AssetClassOwnership_by_AccountIdAndAssetId } from '../../services/iris-assets.service';
import { saveAs } from 'file-saver';

export default function LibraryView(props) {

    const [assets, setAssets] = useState([]);

    const handleSetAssets = async () => {
      if (props.api === null) {
        console.log('props are not yet loaded');
      } else {
        await query_AssetAccess_by_AccountId(props.api, props.account.address,
        (res) => {
          let yourAssets = [];
          res.forEach(([key, exposure]) => {
            let asset_id = parseInt(key.args[1].words[0]);
            let asset_class_owner = exposure.toHuman();
            yourAssets.push({
              owner: asset_class_owner,
              asset_id: asset_id
            });
          });
          setAssets(yourAssets);
        },
        (err) => {
          console.error(err);
        })
      }
    }

    useEffect(() => {
      handleSetAssets();
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

    const handleRpcCall = (owner, asset_id) => {
      query_AssetClassOwnership_by_AccountIdAndAssetId(
        props.api, owner, asset_id,
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
                      <TableCell align="right">{ item.owner  }</TableCell>
                      <TableCell align="right">{ item.asset_id }</TableCell>
                      <TableCell align="right">
                        <button onClick={() => handleRequestData(item.owner, item.asset_id)}>
                          Request
                        </button>
                        <button onClick={() => handleRpcCall(item.owner, item.asset_id)}>
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
