import * as React from 'react';

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
import { 
  call_joinStoragePool, 
  query_StorageProviders,
 } from '../../services/iris-session.service';

export default function StorageManagementView(props) {

    // the asset ids that are available/exist
    const [assetIds, setAssetIds] = useState([]);
    // the asset ids of content you are pinning
    const [storedAssetIds, setStoredAssetIds] = useState([]);
    // const [accumulatedRewardPoints, setAccumulatedRewardPoints] = useState([]);
    // the reward points for the current session
    // const [sessionRewardPoints, setSessionRewardPoints] = useState([]);
    // // the current session era index
    // const [currentEra, setCurrentEra] = useState(0);
    // // the active session era index
    // const [activeEra, setActiveEra] = useState(0);

    useEffect(() => {

      unsub_assetIds();
      unsub_storedAssetIds();

    }, [props]);

  // gross
  const unsub_storedAssetIds = async() => await query_StorageProviders(
    props.api,
    res => {
      let storedAssetIds = [];
      res.forEach(([key, exposure]) => {
        // TODO: really will not scale well
        if (exposure.includes(props.account.publicKey)) {
          let assetId = key.toHuman()[0];
          storedAssetIds.push(assetId);
        }
      });
      setStoredAssetIds(storedAssetIds);
    }
  );

  const unsub_assetIds = async() => await query_AssetIds(
    props.api,
    assetIds => {
      setAssetIds(assetIds);
    }
  );

  // const unsub_currentEraIndex = async() => await query_CurrentEra(
  //   props.api,
  //   eraIndex => setCurrentEra(eraIndex.toString())
  // );

  // const unsub_activeEraIndex = async() => await query_ActiveEra(
  //   props.api,
  //   eraIndex => setActiveEra(eraIndex.toString())
  // );

  // const unsub_erasRewardPoints = async() => await query_ErasRewardPoints(
  //   props.api,
  //   rps => {
  //     rps.forEach((k) => {
  //       // console.log(hexToAscii(String(k[0]).substring(130)));
  //       console.log(JSON.stringify(k));
  //       let sessionRewardPoint = {
  //         total: k[1].total,
  //         individual: k[1].individual,
  //         unallocated: k[1].unallocated,
  //       };
  //       setSessionRewardPoints(s => sessionRewardPoint);
  //     });
  //   }
  // );

    const handleJoinStoragePool = async (assetId) => {
      await call_joinStoragePool(
        props.api, props.account, assetId,
        result => {
          if (result.status.isInBlock) {
            console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          } else if (result.status.isFinalized) {
            console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
            unsub_assetIds();
            unsub_storedAssetIds();
          }
        }
      );  
    }

    return (
        <div className='container'>
          <div className='era-info-container title-container'>
            <span className='section-title'>Storage Management</span>
            {/* <span>Current (Planned) Session: { currentEra }</span>
            <span>Active (Rewarded) Session: { activeEra }</span> */}
            <span>Accumulated Reward points: </span>
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
