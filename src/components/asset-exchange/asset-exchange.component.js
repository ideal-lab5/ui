import { Button, ButtonGroup, TextField } from '@mui/material';
import * as React from 'react';
import { ContractPromise } from '@polkadot/api-contract';

import './asset-exchange.component.css';
import PublishSaleComponent from './publish-sale/publish-sale.component';
import RegistryView from './view-registry/view-registry.component';

export default function AssetExchangeView(props) {

  // this could potentially be abstracted to be made reusable
  const toggleNames = [PublishSaleComponent.name, RegistryView.name];

  const [toggle, setToggle] = React.useState(toggleNames[0]);
  const handleSetToggle = (name) => setToggle(name);

  const [address, setAddress] = React.useState('');
  const handleSetAddress = (addr) => setAddress(addr);

  const [contractPromise, setContractPromise] = React.useState(null);

  const captureFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = async () => {
      const abi = new TextDecoder("utf-8").decode(new Uint8Array(reader.result));
      let contractPromise = new ContractPromise(props.api, JSON.parse(abi), address);
      setContractPromise(contractPromise);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
      <div className="container">
        <div>
          <span className='section-title'>Asset Exchange</span>
        </div>
        <div>
          { contractPromise === null ? 
            <div className='grid'>
              <span>Set Contract Address</span>
              <TextField 
                id="outlined-basic" 
                label="Contract Address"
                variant="outlined"
                onChange={(e) => handleSetAddress(e.target.value)}/>
              <span>Set Contract ABI</span>
              <div>
                <input 
                  id="file-input" 
                  className="file-input" 
                  type="file" 
                  onChange={captureFile} 
                  value="" 
                  autoComplete={"new-password"}
                />
              </div>
            </div>:
            <div>
            <div className="button-container">
              <ButtonGroup variant="text" aria-label="text button group">
                <Button onClick = {() => handleSetToggle('PublishSaleComponent')}>Publish Sale</Button>
                <Button onClick = {() => handleSetToggle('RegistryView')}>View Sales</Button>
              </ButtonGroup>
            </div>
            <div>
              { toggle === PublishSaleComponent.name ?
                <PublishSaleComponent
                  contractPromise={ contractPromise }
                /> :
                <RegistryView /> }
            </div>
          </div>
          }
        </div>
      </div>
    );
}
