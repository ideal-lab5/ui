import * as React from 'react';
import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import MintModal from './mint-modal/mint-modal.component';

import { call_create, call_mint, query_AssetClassOwnership } from '../../services/iris-assets.service';
import CreateModal from './create-modal/create-modal.component';
import { call_registerRule, query_registry } from '../../services/iris-ejection.service';
import { Button } from '@mui/material';
import RuleExecutorRegistryModal from './rule-executor.modal';

export default function ContentManagementView(props) {

    const [assetClasses, setAssetClasses] = useState([]);
    const [ruleExecutorAddress, setRuleExecutorAddress] = useState('');

    const unsub_assetClasses = async () => await query_AssetClassOwnership(
      props.api, 
      props.account.address, 
      assetClassesRaw => {
        let assetClassIds = assetClassesRaw[0].map(item => item.words);
        setAssetClasses(assetClassIds);
      }
    );

    useEffect(() => {
      if (props.api) unsub_assetClasses();
    }, []);

    const handleMint = async (beneficiary, asset_id, amount) => {
      await call_mint(
        props.api, props.account, beneficiary, asset_id, amount,
        result => {
          props.emit('Mint: ' + amount + ' assets with id ' + asset_id + ': in block');
        }, result => {
          props.emit('Mint: ' + amount + ' assets with id ' + asset_id + ': finalized');
        },
      );
    };
  
    const handleCreate = async (bytes, dataspaceId, assetId) => {
      const ipv4 = process.env.REACT_APP_IPV4;
      // if (ipv4 === undefined) {
      //   console.error("Please provide the REACT_APP_IPV4 environment variable to use this functionality.");
      // } else {
      // const res = await props.ipfs.add(bytes);
      // const id = await props.ipfs.id();
      const res = '';
      const id = '';
      const multiAddress = ['', 'ip4', ipv4, 'tcp', '4001', 'p2p', id.id ].join('/');
      const cid = 'TODO';
      await call_create(
        props.api, props.account, multiAddress, cid,
        dataspaceId, assetId, 1,
        result => {
          props.emit('Create: asset with id ' + assetId + ': in block');
        },
        result => { 
          props.emit('Create: asset with id ' + assetId + ': finalized');
          unsub_assetClasses();
        }
      );
      // }
    }

    const handleQueryRuleExecutor = async(assetId) => {
      query_registry(props.api, assetId, result => {
        let readableResult = result.toHuman();
        if (readableResult !== null) {
          setRuleExecutorAddress(readableResult)
        } else {
          setRuleExecutorAddress('no rule registered')
        }
      })
    }

    const handleRegisterRule = async (assetId, ruleAddress) => {
      await call_registerRule(props.api, props.account, ruleAddress, assetId,
        result => {
          props.emit('Register rule address ' + ruleAddress + ' for asset with id ' + assetId + ': in block');
        },
        result => { 
          props.emit('Register rule address ' + ruleAddress + ' for asset with id ' + assetId + ': finalized');
          handleQueryRuleExecutor();
        }
      );
    }

    return (
        <div className="container">
          <div className='title-container'>
            <span className='section-title'>Content Management</span>
          </div>
          <div>
            Add Data
            <CreateModal
              handleCreate={ handleCreate }
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
                    <TableCell align="right">Mint</TableCell>
                    <TableCell align="right">Rule Executor Address</TableCell>
                    <TableCell align="right">Register Rule</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetClasses.map((item, idx) => (
                    <TableRow key={ idx }>
                      <TableCell align="right">{ item[0]  }</TableCell>
                      <TableCell align="right">
                        <MintModal
                          assetId={ item[0] }
                          mint={ handleMint } 
                        />
                      </TableCell>
                      <TableCell align="right">
                        { ruleExecutorAddress === '' ? 
                        <div>
                          <Button
                            className="login-form-button" 
                            variant="contained"
                            color="primary"
                            onClick={() => handleQueryRuleExecutor(item[0])}
                          >
                            Query rule executor address
                          </Button>
                        </div> : 
                        <div>
                          { ruleExecutorAddress }
                        </div> }
                      </TableCell>
                      <TableCell align="right">
                        <RuleExecutorRegistryModal
                          assetId = { item[0] }
                          registerRule = { handleRegisterRule }
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
