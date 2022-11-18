import * as React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

import { encrypt } from '../../services/rpc.service';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { call_create_request, query_ingestion_staging } from '../../services/data-assets.service';
import { Button } from '@material-ui/core';

export default function BlockMonitorView(props) {

  const [historyDepth, setHistoryDepth] = useState(5);
  const [blockData, setBlockData] = useState([]);

  const BlockData = () => {
    return (
      <div>
        
      </div>
    );
  }

  const BlockDataDisplay = () => {
    return (
      <div>

      </div>
    );
  }

  return (
    <div>
      <BlockDataDisplay />  
    </div>
  );
}
