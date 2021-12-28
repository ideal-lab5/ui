import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function LibraryView(props) {

    const handleRequestData = (owner, cid) => {
        props.requestData(
            owner,
            cid
        );
    };

    const handleRpcCall = (publicKey, signature, message) => {
      props.retrieveBytes(publicKey, signature, message);
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
                  {props.library.map((item, idx) => (
                    <TableRow key={ idx } >
                      <TableCell align="right">{ item.owner  }</TableCell>
                      <TableCell align="right">{ item.asset_id }</TableCell>
                      <TableCell align="right">
                        <button onClick={() => handleRequestData(item.owner, item.asset_id)}>
                          Request
                        </button>
                        <button onClick={() => handleRpcCall('', '', item.asset_id.toString())}>
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
