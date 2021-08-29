import { render } from '@testing-library/react';
import React from 'react';
import './App.css';
import IpfsComponent from './components/ipfs/ipfs.component';

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
          MERCURY
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
          <div className="login_component">
            <span>
              Set the host and port that substrate is listening on for WS connections.
            </span>
            <form className="login-form">
              <input type="text" placeholder="host" value={ this.state.host } onChange={ this.handleHostUpdate.bind(this) } />
              <input type="text" placeholder="port" value={ this.state.port } onChange={ this.handlePortUpdate.bind(this) } />
              <input type="submit" value="Connect" onClick={ this.handleConnect.bind(this) } />
            </form>
        </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
