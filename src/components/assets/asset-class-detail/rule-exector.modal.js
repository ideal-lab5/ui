import * as React from 'react';
import { Truncate } from '../../common/common.component';

export default function RuleExecutorModal(props) {

  const handleSubmit = () => {
    setTxSubmitted(true);
    props.registerRuleExecutor(address);
  };

  const [address, setAddress] = React.useState('');
  const [txSubmitted, setTxSubmitted] = React.useState(false);

  return (
    <div>
      {
        props.ruleExecutorAddress === '' ? 
          props.owner === props.account.address ? 
            txSubmitted === true ?
              <span>Waiting...</span> :
              <div>
                <input
                  type='text'
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button onClick={ handleSubmit }>
                  Submit
                </button>
              </div> :
            <span>The owner has not specified a rule executor.</span>
          : <Truncate input={ props.ruleExecutorAddress }  maxLength={ 12 } />
      }
    </div>
  );
}
