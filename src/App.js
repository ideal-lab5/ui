import { render } from '@testing-library/react';
import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IpfsComponent from './components/ipfs/ipfs.component';
import { makeStyles } from '@material-ui/core/styles';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      host: 'localhost',
      port: '9944',
      connect: false,
    }
  }

  handleHostUpdate(e) {
    this.setState({ host: e.target.value });
  }

  handlePortUpdate(e) {
    this.setState({ port: e.target.value });
  }

  handleConnect(e) {
    this.setState({connect: true});
  }

  handleRefresh() {
    window.location.reload(false);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <span>
            IRIS
          </span>
          { this.state.connect === true ? 
              <button onClick={this.handleRefresh.bind(this)}>
                Disconnect
              </button> : '' }
        </header>
        <div className="App-body">
          { this.state.connect === true ?
            <div>
              <IpfsComponent host="localhost" port="9944" />
            </div>
          : 
          <div className="login-component">
            <span>
              Set the host and port that substrate is listening on for WS connections.
            </span>
            <form className="login-form">
              <div className="form-field-container">
                <TextField className="login-form-field" label="Host" variant="outlined" value={ this.state.host } onChange={ this.handleHostUpdate.bind(this)  } />
                <TextField className="login-form-field" label="Port" variant="outlined" value={ this.state.port } onChange={ this.handlePortUpdate.bind(this) } />
              </div>
              <Button className="login-form-button" variant="contained" className="login-submit-btn" color="primary" onClick={ this.handleConnect.bind(this) } >
                Connect  
              </Button>
            </form>
        </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
