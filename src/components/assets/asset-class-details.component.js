import * as React from 'react';
import { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AssetClassDetailView from './asset-class-detail/asset-class-detail.component';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { query_metadata } from '../../services/data-assets.service';

import './asset-class-details.component.css';

export default function AssetClassDetailsView(props) {

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const [rows, setRows] = useState([]);
  const [assetId, setAssetId] = useState('');

  const DetailSearchButton = () => (
    <Button
      // className='login-form-button btn-small'
      variant='contained'
      color='primary'
      onClick={async () => {
        // we only want to get details if they exist
        await query_metadata(
          props.api, assetId, async result => {
            if (result !== null && result.toHuman() !== null) {
              addChildRow(assetId);
            }
          });
      }}
    >Search
    </Button>
  );

  const DisplayResults = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow key="head">
              <StyledTableCell>Asset Id</StyledTableCell>
              <StyledTableCell align="right">CID</StyledTableCell>
              <StyledTableCell align="right">Owner</StyledTableCell>
              <StyledTableCell align="right">Rule Executor</StyledTableCell>
              <StyledTableCell align="right">Decrypt</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { rows.map((row) => row ) }
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  const addChildRow = async(assetId) => {
    setRows(rows => [...rows, 
      <AssetClassDetailView
          key={ assetId }
          account={ props.account }
          alice={ props.alice }
          assetId={ assetId }
          api={ props.api }
          emit={ props.emit }
          ipfs={ props.ipfs }
      />
    ]);
  } 

  return (
    <div className="container">
      <div className='body'>
        <div className='section'>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Search by Asset Id
          </Typography>
          <form className='asset-search-form'>
            <span>Asset Id</span>
            <div>
              <TextField 
                label="asset id" 
                variant="outlined"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={(e) => setAssetId(e.target.value)}/>
              <DetailSearchButton />
            </div>
          </form>
        </div>
        <div className='section'>
          <DisplayResults />
        </div>
      </div>
    </div>
    );
}
