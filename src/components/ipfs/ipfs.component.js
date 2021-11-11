import React from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { saveAs } from 'file-saver';
import { create } from 'ipfs-http-client';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import ClipLoader from "react-spinners/ClipLoader";
// import * as IPFS from 'ipfs-core'
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
      yourAssetClasses: [],
      yourAssets: [],
      ticketAmount: 1,
      selected_asset_class_cid: '',
      mint_balance: 1,
    }
    this.captureEventLogs = this.captureEventLogs.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.monitorEvents = this.handleEmittedEvents.bind(this);
    this.updateElapsedTime = this.updateElapsedTime.bind(this);
    this.mint_tickets = this.mint_tickets.bind(this);
    // event handlers
    this.handleFileDataChange = this.handleFileDataChange.bind(this);
    this.handleAddToIpfsClick = this.handleAddToIpfsClick.bind(this);
    this.handleFileSubmit = this.handleFileSubmit.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    // containers
    this.created_storage_assets = this.created_storage_assets.bind(this);
    this.accessible_assets = this.accessible_assets.bind(this);
    this.mint_ticket_container = this.mint_ticket_container.bind(this);
    // this.newCid_container = this.ipfsItem_container.bind(this);
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
  
  /*
    functions that call extrinsics
  */

  async addBytes(bytesAsString, filename) {
    this.setState({ isRunning: true });
    const res = await this.state.ipfs.add(bytesAsString);
    const id = await this.state.ipfs.id();
    // TODO: how can I inject the proper ip here? there's a lib I think
    const multiAddress = ['', 'ip4', '192.168.1.170', 'tcp', '4001', 'p2p', id.id ].join('/');
    const asset_id = Math.floor(Math.random()*1000);
    this.state.api.tx.templateModule
      .createStorageAsset(this.state.account.address, multiAddress, res.path, asset_id, 1)
      .signAndSend(this.state.account, this.captureEventLogs)
      .then(res => {
        this.updateStorage();
      })
      .catch(err => console.error(err));
      this.setState({ isRunning: false });
  }

  async mint_tickets(beneficiary, cid, amount) {
    await this.state.api.tx.templateModule
      .mintTickets(beneficiary, cid, amount)
      .signAndSend(this.state.account, this.captureEventLogs)
      .then(res => this.updateStorage())
      .catch(err => {
        console.log(err);
      });
  }

  async requestData(owner, cid) {
    await this.state.api.tx.templateModule
      .requestData(owner, cid)
      .signAndSend(this.state.account, this.captureEventLogs)
      .then(res => this.updateStorage())
      .catch(err => {
        console.log(err);
      });
  }

  async catBytes(cid) {
    await this.state.api.tx.templateModule.ipfsCatBytes(cid).signAndSend(this.state.account, this.captureEventLogs);
  }

  async getProviders(cid) {
    await this.state.api.tx.templateModule.ipfsDhtFindProviders(cid).signAndSend(this.state.account, this.captureEventLogs);
  }

  /*
    Functions that query substrate storage
  */
  async updateStorage() {
    await this.parse_asset_class_ownership();
    await this.parse_assets();
  }

  async parse_asset_class_ownership() {
    // get your owned assets
    let asset_class_entries = await this.state.api.query.templateModule.assetClassOwnership.entries(this.state.account.address);
    let yourAssetClasses = [];
    for (let i = 0; i < asset_class_entries.length; i++) {
      // accountid -> cid -> assetid
      const entry = asset_class_entries[i];
      const cid = this.hexToAscii(String(entry[0]).substr(196));
      yourAssetClasses.push({
        cid: cid,
        assetId: parseInt(String(entry[1])),
      });
    }
    this.setState({ yourAssetClasses });
  }

  async parse_assets() {
    // get your asset balances
    let assets_entries = await this.state.api.query.templateModule.assetAccess.entries(this.state.account.address);
    let yourAssets = [];
    for (let i = 0; i < assets_entries.length; i++) {
      const entry = assets_entries[i];
      const owner = String(entry[1]);
      const cid = this.hexToAscii(String(entry[0]).substr(196));
      yourAssets.push({
        owner: owner,
        cid: cid
      });
    }
    this.setState({ yourAssets });
  }

  /*
    Event Handlers
  */
  handleEmittedEvents() {
    this.state.api.query.system.events((events) => {
      events.forEach(record => {
        const { event,  } = record;
        const eventData = event.data;
        this.updateStorage();
        if (event.method === 'AssetClassCreated') {
          this.updateStorage();
        } else if (event.method === 'DataReady') {
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
    User Input Event handlers
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

  handleSelectStorageAsset(cid) {
    this.setState({ selected_asset_class_cid: cid });
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

  created_storage_assets() {
    return (
      <div className="event-log_container">
        <span className="event-logs-header">
          Your Created Assets
        </span>
        <div className="event-log-item-container">
          {this.state.yourAssetClasses.map((body, idx) => {
            return  <span key={ idx } onClick={() => this.handleSelectStorageAsset(body.cid)}>
                      { body.assetId } : { body.cid } 
                    </span>
          })}
        </div>
      </div>
    );
  }

  accessible_assets() {
    return (
      <div className="event-log_container">
        <span className="event-logs-header">
          Accessible Assets (Data)
        </span>
        <div className="event-log-item-container">
          {this.state.yourAssets.map((asset_balance, idx) => {
            return  <span key={ idx } onClick={() => this.requestData(asset_balance.owner, asset_balance.cid)}>
                      { idx } : { asset_balance.cid }
                    </span>
          })}
        </div>
      </div>
    );
  }

  mint_ticket_container() {
    if (this.state.selected_asset_class_cid === '') {
       return (
         <div>

         </div>
       );
    }
    return (
      <div>
        <span>Mint Tickets</span>
        <div className="mint_container event-log-item-container">
          { this.state.selected_asset_class_cid }
          <button onClick={() => this.handleSelectStorageAsset('') }>
              close
            </button>
          <label htmlFor="ticket-amount">
            Number of assets to mint
          </label>
          <input 
            name="ticket-amount"
            type="number"
            placeholder="Enter a number greater than 0"
            value={this.state.ticketAmount}
            onChange={this.setTicketAmount.bind(this)}
          />
          <label htmlFor="balance">
            Balance to back the asset
          </label>
          <input
            name="balance"
            type="number"
            placeholder="Enter a number greater than 0"
            value={this.state.mint_balance}
            onChange={this.setMintBalance.bind(this)}
          />
          <button onClick={() => this.mint_tickets(
              this.state.account.address,
              this.state.selected_asset_class_cid,
              this.state.ticketAmount
            )}>
              Mint
            </button>
        </div>
      </div>
    );
  }

  setTicketAmount(e) {
    this.setState({ticketAmount: e.target.value});
  }

  setMintBalance(e) {
    this.setState({ mint_balance: e.target.value });
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
                    { this.mint_ticket_container() }
                  </div>
                </div>}
                <div>
                  { this.created_storage_assets() }
                  { this.accessible_assets() }
                </div>
          </div>
      );
  }

}

export default IpfsComponent;