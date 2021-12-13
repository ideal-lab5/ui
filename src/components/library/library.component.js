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

    const handleRpcCall = (publicKey, signature, mesage) => {
      props.retrieveBytes(publicKey, signature, mesage);
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
                    <TableCell align="right">CID</TableCell>
                    <TableCell align="right">Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.library.map((item, idx) => (
                    <TableRow key={ idx } >
                      <TableCell align="right">{ item.owner  }</TableCell>
                      <TableCell align="right">{ item.cid }</TableCell>
                      <TableCell align="right">
                        <button onClick={() => handleRequestData(item.owner, item.cid)}>
                          Request
                        </button>
                        <button onClick={() => handleRpcCall('', '', item.cid)}>
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
