import React from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { create } from 'ipfs-http-client';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StorageIcon from '@mui/icons-material/Storage';

import ContentManagementView from "../content-management/content-management.component";
import LibraryView from "../library/library.component";
import StorageManagementView from "../storage-management/storage-management.component";


import ClipLoader from "react-spinners/ClipLoader";

import './home.component.css';

// js-ipfs config options documented here:
// https://hub.docker.com/r/ipfs/js-ipfs/
class HomeComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      isRunning: false,
      default_account: null,
      account: null,
      api: null,
      ipfs: null,
      connectionAliveTime: 0,
      eventLogs: [],
      selectedToggle: '',
    }
    this.captureEventLogs = this.captureEventLogs.bind(this);
    this.handleEmittedEvents = this.handleEmittedEvents.bind(this);
    this.updateElapsedTime = this.updateElapsedTime.bind(this);
  }
    
  async componentDidMount() {
    if (this.state.api === null) {
      if (this.state.ipfs === null) {
        const ipfs = await create({
          host: 'localhost',
          port: 5001,
          protocol: 'http',
        });
        this.setState({ ipfs: ipfs });
      }

      const host = this.props.host;
      const port = this.props.port;

      const provider = new WsProvider(`ws://${host}:${port}`);
      const api = await ApiPromise.create({
          provider,
          types: {
              DataCommand: '_DataCommand',
          },
          rpc: {
            iris: {
              retrieveBytes: {
                description: 'retrieve bytes from iris',
                params: [
                  {
                    name: 'message',
                    type: 'Bytes'
                  }
                ],
                type: 'Bytes'
              }
            }
          }
      });
      await api.isReady;
      setInterval(() => {this.updateElapsedTime(1000)}, 1000);
      this.setState({ isConnected: true });
      const keyring = new Keyring({ type: 'sr25519' });
      const account = keyring.addFromUri('//' + this.props.address);
      this.setState({ 
        api: api, 
        default_account: account, 
        selectedToggle: 'ContentManagementView'
      });
      this.handleEmittedEvents(api);
    }
  }

  clearEventLogs() {
    this.setState({ eventsLogs: [] });
  }

  updateElapsedTime(t) {
    const updateAliveTime = this.state.connectionAliveTime + t;
    this.setState({connectionAliveTime: updateAliveTime})
  }

  addToEventLog(message) {
    const newEventLogs = this.state.eventLogs.concat(message);
    this.setState({ eventLogs: newEventLogs });
  }

  clearEventLog() {
    this.setState({ eventLogs: [] });
  }

  getAccount() {
    return this.state.account === null ? this.state.default_account : this.state.account;
  }

  /*
    Event Handlers
  */
  handleEmittedEvents() {
    this.state.api.query.system.events((events) => {
      events.forEach(record => {
        const { event,  } = record;
        // const eventData = event.data;
        console.log(JSON.stringify(event));
      });
    });
  }

  captureEventLogs(e) {
    const status = e.status;
    const events = e.events;
    if (status.isInBlock) {
         this.addToEventLog(`included in ${status.asInBlock}`);
    }
    if (events !== undefined && (status.isInBlock || status.isFinalized)) {
      events.forEach((record) => {
        const { event, phase } = record;
        const types = event.typeDef;
        this.addToEventLog(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        if (event.data !== undefined) {
          event.data.forEach((data, index) => {
            if (data !== undefined) {
              this.addToEventLog(`\t\t\t${types[index].type}: ${data.toString()}`);
            }
          });
        }
      })
    }
  }

  msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }

  /*
    User Input Event handlers
  */
  updateToggle(value) {
    this.setState({ selectedToggle: value });
    // this.forceUpdate();
  }

  /*
    DOM elements
  */

  eventLogs_container() {
    return (
      <div className="event-log_container">
        <span className="event-logs-header">
          Event Logs
        </span>
        <button onClick={this.clearEventLog.bind(this)}>
          Clear
        </button>
        <div className="event-log-item-container">
          {this.state.eventLogs.map((line, idx) => {
            return  <span key={ idx }>
                      { idx } : { line }
                    </span>
          })}
        </div>
      </div>
    );
  }
  
  render() {
      return (
          <div className="ipfs-container">
            <div className="sidebar">
              <div className="sidebar-item" onClick={() => this.updateToggle('ContentManagementView')}>
                Content Management <UploadFileIcon />
              </div>
              <div className="sidebar-item" onClick={() => this.updateToggle('LibraryView')}>
                Library <LibraryBooksIcon />
              </div>
              <div className="sidebar-item" onClick={() => this.updateToggle('StorageManagementView')}>
                Storage Management <StorageIcon />
              </div>
            </div>
            <div className="content-container">
            { this.state.isConnected === false ? 
              <div className="loader-container">
                <ClipLoader loading={!this.state.isConnected} size={100} />
              </div> :
              <div className="top-level-container">
                <div className="container">
                  <div className="session-info-container">
                    { this.state.default_account === null ? '' : 
                      <div className="session-info-container">
                        <span>{ this.getAccount().address }</span>
                        <span>Connected for: { this.msToTime(this.state.connectionAliveTime) }</span>
                      </div>
                    }
                  </div>
                  {/* { this.eventLogs_container() } */}
                </div>
              </div>}
              <div className="assets-container">
                <div className="assets-view-container">
                  { this.state.selectedToggle === 'ContentManagementView' ? 
                    <ContentManagementView
                      account={ this.getAccount() }
                      api={ this.state.api }
                      ipfs={ this.state.ipfs }
                      // eventLogHandler={ this.handleEmittedEvents }
                    /> : this.state.selectedToggle === 'LibraryView' ?
                    <LibraryView
                      account={ this.getAccount() }
                      api = { this.state.api }
                      // eventLogHandler={ this.handleEmittedEvents }
                    /> :
                    <StorageManagementView
                      account={ this.getAccount() }
                      api={ this.state.api }
                      // eventLogHandler={ this.handleEmittedEvents }
                      storageProviderAssetConfig={ this.state.storageProviderAssetConfig }
                    />
                  }
                </div>
              </div>
              </div>
          </div>
      );
  }

}

export default HomeComponent;