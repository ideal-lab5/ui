import { Button } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { query_assetClassDetails } from '../../../services/assets.service';
import { query_metadata } from '../../../services/data-assets.service';
import { query_registry } from '../../../services/iris-ejection.service';

export default function AssetClassDetailView(props) {

  const [CID, setCID] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [ruleExecutorAddress, setRuleExecutorAddress] = useState('');

  const [assetDetails, setAssetDetails] = useState({
    owner: '',
    supply: 0,
  });

  useEffect(() => {
    if  (props.api !== null) {
      queryMetadata();
      queryAssetClassDetails();
      queryRuleExecutor();
    }
  }, []);

  const queryMetadata = async () => {
    await query_metadata(
      props.api, props.assetId, result => {
        setCID(result.toHuman().cid);
        setPublicKey(result.toHuman().publicKey);
      });
  }

  const queryAssetClassDetails = async () => {
    await query_assetClassDetails(
      props.api, props.assetId, result => {
        let res = result.toHuman();
        setAssetDetails({
          owner: res.owner,
          admin: res.admin,
          supply: res.supply,
          deposit: res.deposit,
          minBalance: res.minBalance,
        });
      }
    );
  }

  const queryRuleExecutor = async() => {
    await query_registry(props.api, props.assetId, result => {
      let readableResult = result.toHuman();
      if (readableResult !== null) {
        setRuleExecutorAddress(readableResult)
      }
    })
  }

  const Metadata = () => {
    return (
      <div className='section'>
        <span>CID: {CID}</span>
        <span>Public Key: {publicKey}</span>
        <span>Owner: {assetDetails.owner}</span>
        <span>Supply: {assetDetails.supply}</span>
        <span>Rule Executor Address: {ruleExecutorAddress}</span>
      </div>
    );
  }

  const RequestAccess = () => {
    return (
      <div className='section'>
        {ruleExecutorAddress !== '' ? 
        <Button>
          Purchase
        </Button>
        : <div></div> }
      </div> 
    );
  }

  return (
    <div className="section">
      <span>Asset Class Details</span>
      <span>assetId: { props.assetId }</span>
      <Metadata />
      <RequestAccess />
    </div>
    );
}
