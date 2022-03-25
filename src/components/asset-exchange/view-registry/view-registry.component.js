import * as React from 'react';

import './view-registry.component.css';

import { read_registry } from '../../../services/iris-asset-exchange.service';

export default function RegistryView(props) {

  const readRegistry = async () => {
    await read_registry(props.api, props.abi, props.account, props.address, result => {
      console.log(result.toHuman());
      if (result.status.isInBlock) {
        console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
      } else if (result.status.isFinalized) {
        console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
      }
    });
  }

  React.useEffect(() => {
    readRegistry();
  }, []);

    return (
        <div className="container">
          <div>
            <span>Registry</span>
          </div>
        </div>
      );
}
