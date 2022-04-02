import * as React from 'react';

import './view-registry.component.css';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { query_AssetAccess_by_AccountId } from '../../../../services/iris-assets.service';
import { call_purchaseTokens } from '../../../../services/iris-asset-exchange.service';
import ViewTokenSaleDetailsModal from './view-registry.modal';

export default function RegistryView(props) {

  const [availableAssets, setAvailableAssets] = React.useState([]);

  const loadAvailableAssets = async () => {
    await query_AssetAccess_by_AccountId(
      props.api, props.contractAddress, 
      result => {
        let assetIds = result.map(item => item.words);
        setAvailableAssets(assetIds);
      }
    );
  }

  React.useEffect(() => {
    loadAvailableAssets();
  }, []);


  const handle_purchaseTokens = (assetId, amount) => {
    call_purchaseTokens(
      props.contractPromise, props.account, 0, -1, assetId, amount,
      result => {
        props.emit('Purchase Tokens: ' + 
          amount + ' units of asset id ' + 
          assetId + ' : In block');  
    }, result => {
      props.emit('Purchase Tokens: ' + 
          amount + ' units of asset id ' + 
          assetId + ' : Finalized');  
    });
  }

  return (
      <div className="container">
        <div>
          <span>Registry</span>
        </div>
        <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Asset Id</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableAssets.map((item, idx) => (
              <TableRow key={ idx }>
                <TableCell align="right">{ item }</TableCell>
                <TableCell align="right">
                  <ViewTokenSaleDetailsModal
                    assetId={ item[0] }
                    api={ props.api }
                    purchaseTokens={ handle_purchaseTokens }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
    );
}
