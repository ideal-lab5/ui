import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Home from './components/home/home.component';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const hostedNodeConfig = {
  alice: {
    uri: '//Alice',
    host: '18.118.65.202',
    port: '9944',
  },
  bob: {
    uri: '//Bob',
    host: '3.12.124.166',
    port: '9944',
  },
  charlie: {
    uri: '//Charlie',
    host: '3.14.26.5',
    port: '9944',
  },
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      host: 'localhost',
      port: '9944',
      address: 'Alice',
      connect: false,
      conigure: true,
    }

    this.handleKeyPressed = this.handleKeyPressed.bind(this);
  }


  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPressed);
  }

  handleHostUpdate(e) {
    this.setState({ host: e.target.value });
  }

  handlePortUpdate(e) {
    this.setState({ port: e.target.value });
  }

  handleAddressUpdate(e) {
    this.setState({ address: e.target.value });
  }

  handleConnect() {
    this.setState({connect: true});
  }

  handleRefresh() {
    window.location.reload(false);
  }

  handleKeyPressed(e) {
    if (e.key === 'Enter') {
      this.handleConnect();
    }
  }

  handleChange(e) {
    let config = hostedNodeConfig[e.target.value];
    if (config !== undefined && config !== null) {
      this.setState({
        host: config.host,
        port: config.port,
        address: config.uri,
        configure: false,
      }); 
    } else {
      this.setState({configure: true});
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-body">
          { this.state.connect === true ?
            <div>
              <Home
                host={this.state.host} 
                port={this.state.port} 
                address={this.state.address}
              />
            </div>
          : 
          <div className="login-component">
            <span>
              Set the host and port that Iris is listening on for WS connections.
            </span>
            <FormControl fullWidth>
              <InputLabel id="node-select-label">Node Selection</InputLabel>
              <Select
                labelId="node-select-label"
                id="node-select"
                label="node"
                onChange={this.handleChange.bind(this)}
              >
                <MenuItem value={'alice'}>Alice</MenuItem>
                <MenuItem value={'bob'}>Bob</MenuItem>
                <MenuItem value={'charlie'}>Charlie</MenuItem>
                <MenuItem value={'custom'}>Custom</MenuItem>
              </Select>
            </FormControl>
            { this.state.configure === true ? 
              <form className="login-form">
                <div className="form-field-container">
                  <TextField
                    className="login-form-field" 
                    label="Host" 
                    variant="outlined" 
                    value={ this.state.host } 
                    onChange={ this.handleHostUpdate.bind(this)  }
                  />
                  <TextField
                    className="login-form-field" 
                    label="Port" 
                    variant="outlined" 
                    value={ this.state.port } 
                    onChange={ this.handlePortUpdate.bind(this) } 
                  />
                  <TextField
                    className="login-form-field" 
                    label="Address" 
                    variant="outlined"
                    value={ this.state.address }
                    onChange={ this.handleAddressUpdate.bind(this) }
                  />
                </div>
              </form>
            : <div>
              </div> }

              <div>
            <Button 
              className="login-form-button login-submit-btn" 
              variant="contained"
              color="primary" 
              onClick={ this.handleConnect.bind(this) } 
            > Connect 
            </Button>
          </div>
        </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
