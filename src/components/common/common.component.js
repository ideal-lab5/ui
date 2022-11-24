import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

export const Truncate = (props) => {
    const input = props.input === undefined ? '' : props.input;
    const len = props.maxLength; 
    const out = input.length > len ? input.substring(0, len) + '...' : input; 
    return (
      <div>
        <span>{ out }</span>
        { props.copy === false ?  <div></div> :
        <FontAwesomeIcon
          className='copy'
          icon={faCopy}
          onClick={() => navigator.clipboard.writeText(input) }
        /> }
      </div>
    );
  }