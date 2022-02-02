import * as React from 'react';

import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { useState, useEffect } from 'react';
import { query_AssetIds } from '../../services/iris-assets.service';

import './storage-management.component.css';
import { call_joinStoragePool, query_StorageProviders_by_AssetId, query_StorageProviders } from '../../services/iris-session.service';

export default function StorageManagementView(props) {

    const [assetIds, setAssetIds] = useState([]);
    const [storedAssetIds, setStoredAssetIds] = useState([]);

    const handleSetAssetIds = async () => {
      if (props.api === null) {
        console.log("props not yet initialized");
      } else {
        await query_AssetIds(
          props.api,
          res => {
            setAssetIds(res);
          },
          err => console.error(err)
        );
      }
    }

    const handleSetStoredAssetIds = async () => {
      if (props.api === null) {
        console.log("props not yet initialized");
      } else {
        await query_StorageProviders(
          props.api,
          res => {
            let storedAssetIds = [];
            res.forEach(([key, exposure]) => {
              if (exposure.includes(props.account.publicKey)) {
                storedAssetIds.push(key.toHuman()[0]);
              }
            });
            setStoredAssetIds(storedAssetIds);
          },
          err => console.error(err)
        );
      }
    }

    useEffect(() => {
      handleSetAssetIds();
      handleSetStoredAssetIds();
    }, []);



    const handleJoinStoragePool = async (assetId) => {
      await call_joinStoragePool(
        props.api, props.account, assetId,
        res => {
          console.log(JSON.stringify(res));
          console.log("Extrinsic submitted successfully");
        },
        err => console.error(err)
      );
      // await query_StorageProviders(
      //   props.api, assetId,
      //   res => {
      //     if (!res.includes(props.account.publicKey)) {
      //       call_joinStoragePool(
      //         props.api, props.account, assetId,
      //         res => {
      //           console.log(JSON.stringify(res));
      //           console.log("Extrinsic submitted successfully");
      //         },
      //         err => console.error(err)
      //       );
      //     } else { 
      //       console.log("Ignoring the request: You are already a member of the storage pool");
      //     }
      //   },
      //   err => {
      //     console.error(err);
      //   }
      // );  
    }

    return (
        <div className='storage-management-container'>
          <div>
            <span>Storage Management</span>
          </div>
          { assetIds.length === 0 ? 
            <div>
              <span>
                No assets are available for storage.
              </span>
            </div>:
            <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Asset Id</TableCell>
                  <TableCell align="right">Join Storage Pool</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { assetIds.map((item, idx) => (
                  <TableRow key={ idx }>
                    <TableCell align="right">{ item.words }</TableCell>
                    <TableCell align="right">
                    { storedAssetIds.join(',').includes(item.words) === true ?
                        <div>
                          <span>Already a member</span>
                        </div> : 
                        <div>
                        <Button onClick={() => handleJoinStoragePool(item.words)}>
                          Join
                        </Button>
                        </div>
                      }
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
