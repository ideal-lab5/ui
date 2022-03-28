import * as React from 'react';
import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import './publish-sale.component.css';
import { query_AssetClassOwnership } from '../../../../services/iris-assets.service';
import PublishSaleModal from './publish-sale.modal';
import { call_publishTokenSale } from '../../../../services/iris-asset-exchange.service';

export default function PublishSaleComponent(props) {

  const [assetClasses, setAssetClasses] = useState([]);

  const unsub_assetClasses = async () => await query_AssetClassOwnership(
    props.api, 
    props.account.address, 
    assetClassesRaw => {
      let assetClassIds = assetClassesRaw[0].map(item => item.words);
      setAssetClasses(assetClassIds);
    }
  );
  useEffect(() => {
    if (props.account) {
      unsub_assetClasses();
    }
  }, []);

  const publishTokenSale = async (assetId, quantity, price) => {
    await call_publishTokenSale(
      props.contractPromise, props.account, 0, -1,
      assetId, quantity, price, result => {
        props.emit('Publish Token Sale: ' + 
          quantity + ' units of asset id ' + 
          assetId + ' at ' + 
          price + ' IRIS/unit: In block');  
    }, result => {
      props.emit('Publish Token Sale: ' + 
          quantity + ' units of asset id ' + 
          assetId + ' at ' + 
          price + ' IRIS/unit: Finalized');  
    });
  }

  return (
      <div className="container">
        <div>
          <span>Publish Sale</span>
        </div>
        <div>
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
                <TableCell align="right">Publish</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assetClasses.map((item, idx) => (
                <TableRow key={ idx }>
                  <TableCell align="right">{ item }</TableCell>
                  <TableCell align="right">
                    <PublishSaleModal 
                      assetId={ item }
                      publishTokenSale={ publishTokenSale }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        }
        </div>
      </div>
    );
}
