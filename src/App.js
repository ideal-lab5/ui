import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Home from './components/home/home.component';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      host: 'localhost',
      port: '9944',
      address: 'Alice',
      connect: false,
      useLightClient: false,
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

  handleConnect(e) {
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

  handleUseLightClient(e) {
    this.setState({ useLightClient: !this.state.useLightClient });
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
                useLightClient={this.state.useLightClient}
              />
            </div>
          : 
          <div className="login-component">
            <span>
              Set the host and port that Iris is listening on for WS connections.
            </span>
            <form className="login-form">
              <div className="form-field-container">
                <TextField 
                  disabled={ this.state.useLightClient }
                  className="login-form-field" 
                  label="Host" 
                  variant="outlined" 
                  value={ this.state.host } 
                  onChange={ this.handleHostUpdate.bind(this)  }
                />
                <TextField 
                  disabled={ this.state.useLightClient }
                  className="login-form-field" 
                  label="Port" 
                  variant="outlined" 
                  value={ this.state.port } 
                  onChange={ this.handlePortUpdate.bind(this) } 
                />
                <TextField
                  disabled={ this.state.useLightClient }
                  className="login-form-field" 
                  label="Address" 
                  variant="outlined"
                  value={ this.state.address }
                  onChange={ this.handleAddressUpdate.bind(this) }
                />
              </div>
              <div>
                <Button 
                  className="login-form-button login-submit-btn" 
                  variant="contained"
                  color="primary" 
                  onClick={ this.handleConnect.bind(this) } 
                > Connect 
                </Button>
                {/* <FormGroup>
                  <FormControlLabel control={<Switch onChange={ this.handleUseLightClient.bind(this) } />} label="Use Light Client" />
                </FormGroup> */}
              </div>
            </form>
        </div>
          }
        </div>
        {/* <div className='footer'>
          <a href='https://www.github.com/ideal-lab5/' target='_blank'>
            <FontAwesomeIcon
              icon={faGithub}
            />
          </a>
          <span>Ideal Labs, 2022</span>
        </div> */}
      </div>
    );
  }
}

export default App;
