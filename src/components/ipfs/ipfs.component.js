import React from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { saveAs } from 'file-saver';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import ClipLoader from "react-spinners/ClipLoader";
import * as IPFS from 'ipfs-core'
// import Fab from '@material-ui/core/Fab';
// import AddIcon from '@material-ui/icons/Add';

import './ipfs.component.css';

// js-ipfs config options documented here:
// https://hub.docker.com/r/ipfs/js-ipfs/
class IpfsComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      isRunning: false,
      account: null,
      api: null,
      ipfs: null,
      fileData: '',
      newCIDEvents: [],
      ipfsItems: [],
      connectionAliveTime: 0,
      eventLogs: [],
    }
    this.captureEventLogs = this.captureEventLogs.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.monitorEvents = this.handleEmittedEvents.bind(this);
    this.updateElapsedTime = this.updateElapsedTime.bind(this);
    // event handlers
    this.handleFileDataChange = this.handleFileDataChange.bind(this);
    this.handleAddToIpfsClick = this.handleAddToIpfsClick.bind(this);
    this.handleFileSubmit = this.handleFileSubmit.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    // containers
    this.newCid_container = this.ipfsItem_container.bind(this);
  }
    
  async componentDidMount() {
    if (this.state.api === null) {
      if (this.state.ipfs === null) {
        const ipfs = await IPFS.create({
          preload: {
            enabled: false
          },
          libp2p: {
            config: {
              peerDiscovery: {
                enabled: false
              }
            }
          },
        });

        // Addresses: {
        //   Swarm: [
        //     '/ip4/0.0.0.0/tcp/4002',
        //     '/ip4/127.0.0.1/tcp/4003/ws',
        //   ]
        // }

        this.setState({ ipfs });
        const id = await this.state.ipfs.id();
        console.log(id);
        const peer_info = await this.state.ipfs.config.get("Addresses.Swarm");
        console.log("peer info");
        console.log(peer_info);
      }

      const host = this.props.host;
      const port = this.props.port;

      const provider = new WsProvider(`ws://${host}:${port}`);
      const api = await ApiPromise.create({
          provider,
          types: {
              ConnectionCommand: '_ConnectionCommand',
              DataCommand: '_DataCommand',
              DhtCommand: '_DhtCommand',
              Address: 'MultiAddress',
              LookupSource: 'MultiAddress',
          }
      });
      await api.isReady;
      setInterval(() => {this.updateElapsedTime(1000)}, 1000);
      this.setState({ isConnected: true });
      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice');
      this.setState({ api: api, account: alice });
      this.handleEmittedEvents(api);
      this.updateStorage();
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

  async addBytes(bytesAsString, filename) {
    this.setState({ isRunning: true });
    const res = await this.state.ipfs.add(bytesAsString);
    console.log(res.path);
    const id = await this.state.ipfs.id();
    console.log("The id is {}", id.id);
    // const id = '12D3KooWMvyvKxYcy9mjbFbXcogFSCvENzQ62ogRxHKZaksFCkAp';
    const multiAddress = ['', 'ip4', '127.0.0.1', 'tcp', '4001', 'p2p', id.id ].join('/');
    console.log(multiAddress);
    this.state.api.tx.templateModule
      .ipfsAddBytes(multiAddress, res.path, filename)
      .signAndSend(this.state.account, this.captureEventLogs)
      .then(res => {
        console.log(res);
      })
      .catch(err => console.error(err));
      this.setState({ isRunning: false });
  }

  async catBytes(cid) {
    await this.state.api.tx.templateModule.ipfsCatBytes(cid).signAndSend(this.state.account, this.captureEventLogs);
  }

  async getProviders(cid) {
    await this.state.api.tx.templateModule.ipfsDhtFindProviders(cid).signAndSend(this.state.account, this.captureEventLogs);
  }

  async updateStorage() {
      let entries = await this.state.api.query.templateModule.fsMap.entries();
      // assume we're synced with the entries to a certain extent, and we'll assume order is preserved
      let newItems = [];
      for(let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const cid = this.hexToAscii(String(entry[0]).substr(100));
          const filename = this.hexToAscii(String(entry[1]).substr(2));
          newItems.push({
            cid: cid,
            filename: filename,
          });
      }
      this.setState({ ipfsItems: newItems });
  }

  handleEmittedEvents() {
    this.state.api.query.system.events((events) => {
      events.forEach(record => {
        const { event,  } = record;
        const eventData = event.data;
        if (event.method === 'NewCID') {
          console.log('NewCID event: update storage');
          this.updateStorage();
        } else if (event.method === 'DataReady') {
          console.log('DataReady event: Download begin');
          const fileContent = this.hexToAscii(String(eventData[0]).substr(2));
          const filename = this.hexToAscii(String(eventData[1]).substr(2));
          this.download(fileContent, filename);
        }
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

  captureFile(e) {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = async () => {
      const resultString = this.arrayBufferToString(reader.result);
      await this.addBytes(resultString, file.name, file.size);
    };
    reader.readAsArrayBuffer(file);
  }

  download(file, filename) {
    const mime = require('mime-types');
    const type = mime.lookup(filename);
    const blob = new Blob([file], {type: type});
    saveAs(blob, filename);
}

  arrayBufferToString = (arrayBuffer) => {
    return new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
  }

  hexToAscii(str1) {
	  var hex  = str1.toString();
	  var str = '';
	  for (var n = 0; n < hex.length; n += 2) {
		  str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	  }
	  return str;
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
    Event handlers
  */
  handleFileDataChange(e) {
    e.preventDefault();
    this.setState({ fileData: e.target.value });
  }
  
  handleAddToIpfsClick(e) {
    e.preventDefault();
    this.addBytes(this.state.api, this.state.fileData);
  }

  handleDownload(cid) {
    this.catBytes(cid);
  }

  handleFileSubmit(e) {
    e.preventDefault();
  }

  handleFindProviders(cid) {
    this.getProviders(cid);
  }

  /*
    Containers
  */
  ipfsItem_container() {
    return (
      <div className="container">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Filename</TableCell>
                <TableCell align="right">CID</TableCell>
                <TableCell align="right">Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.ipfsItems.map((item, idx) => (
                <TableRow key={ idx }>
                  <TableCell align="right">{ item.filename  }</TableCell>
                  <TableCell align="right">{ item.cid }</TableCell>
                  <TableCell align="right">
                    <button onClick={this.handleDownload.bind(this, item.cid)}>
                      Download
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }

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
              { this.state.isConnected === false ? 
                <div className="loader-container">
                  <ClipLoader loading={!this.state.isConnected} size={150} />
                </div> :
                <div>
                  <div className="container">
                    <div>
                      <span className="dot active"></span> Connected { this.msToTime(this.state.connectionAliveTime) }
                    </div>
                   { this.eventLogs_container() }
                  </div>
                  <div>
                    <input id="file-input" className="file-input" type="file" onChange={this.captureFile} value="" autoComplete={"new-password"} />
                  </div>
                  { this.ipfsItem_container() }
                </div>}
          </div>
      );
  }

}

export default IpfsComponent;