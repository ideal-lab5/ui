import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Home from './components/home/home.component';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      host: 'localhost',
      port: '9944',
      address: 'Alice',
      connect: false,
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
              Set the host and port that substrate is listening on for WS connections.
            </span>
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
              <Button 
                className="login-form-button login-submit-btn" 
                variant="contained"
                color="primary" 
                onClick={ this.handleConnect.bind(this) } 
              > Connect 
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
