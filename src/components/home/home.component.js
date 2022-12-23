import React, { useEffect, useState } from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { create } from 'ipfs-http-client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import {
    Route,
    Routes,
    Link,
  } from "react-router-dom";

import './home.component.css';
import { Button, Snackbar, TextField } from "@mui/material";
import Alert from '@mui/material/Alert';
import UploadView from "../upload/upload.component";
import AssetClassDetailsView from "../assets/asset-class-details.component";

import irisSpec from '../../resources/iris.json';
import { ScProvider } from "@polkadot/rpc-provider";

import './home.component.css';

export default function Home(props) {

    const [ipfs, setIpfs] = useState(null);
    const [ipfsHost, setIpfsHost] = useState('');
    const [ipfsPort, setIpfsPort] = useState(5001);
    const [api, setApi] = useState(null);
    const [account, setAccount] = useState(null);
    const [alice, setAlice] = useState(null);

    const initializeApi = async () => {
        let provider;
        if (props.useLightClient) {
            const customSpec = JSON.stringify(irisSpec);
            provider = new ScProvider(customSpec);
            await provider.connect();

        } else {
            const host = props.host;
            const port = props.port;        
            provider = new WsProvider(`ws://${host}:${port}`);
        }

        const api = await ApiPromise.create({
            provider,
            rpc: {
              iris: {
                encrypt: {
                    description: 'Encrypt plaintext and stage data for ingestion into iris.',
                    params: [
                        {
                            name: 'plaintext',
                            type: 'Bytes'
                        },
                        {
                            name: 'signature',
                            type: 'Bytes'
                        },
                        {
                            name: 'signer',
                            type: 'Bytes'
                        },
                        {
                            name: 'message',
                            type: 'Bytes'
                        },
                        {
                            name: 'proxy',
                            type: 'Bytes'
                        }
                    ],
                    type: 'Bytes'
                },
                decrypt: {
                    description: 'Decrypt data that was encrypted through Iris',
                    params: [
                        {
                            name: 'ciphertext',
                            type: 'Bytes'
                        },
                        {
                            name: 'signature',
                            type: 'Bytes'
                        },
                        {
                            name: 'signer',
                            type: 'Bytes'
                        },
                        {
                            name: 'message',
                            type: 'Bytes'
                        },
                        {
                            name: 'assetId',
                            type: 'u32'
                        }, 
                        {
                            name: 'secretKey',
                            type: 'Bytes'
                        }
                    ],
                    type: 'Bytes'
                }
              }
            }
        });
        await api.isReady;
        setApi(api);
        const keyring = new Keyring({ type: 'sr25519' });
        const account = keyring.addFromUri('//' + props.address);
        const alice = keyring.addFromUri('//Bob');
        setAccount(account);
        setAlice(alice);
    }

    const handleEvent = (eventMessage) => {
        setAlertMessage(eventMessage);
        handleClick();
    }

    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

    useEffect(() => {
        if (props.port && props.host) {
            initializeApi();
            let localStorage_ipfsHost = localStorage.getItem("ipfsHost");
            let localStorage_ipfsPort = localStorage.getItem("ipfsPort");

            if (localStorage_ipfsHost !== null) {
                handleIpfsConnect(localStorage_ipfsHost, localStorage_ipfsPort);
                setIpfsHost(localStorage_ipfsHost);
                setIpfsPort(localStorage_ipfsPort);
            }
        }
    }, [props.port, props.host, initializeApi]);

    const handleIpfsConnect = async(host, port) => {
        const ipfs = await create({
            host: host,
            port: port,
            protocol: 'http',
        });
        setIpfs(ipfs);
    }

    return (
        <div className="container">
            <div>
                <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} 
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}} key={'top right'}>
                    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                        {alertMessage}
                    </Alert>
                </Snackbar>
                <div>
                    <AppBar position="fixed"
                        sx={{bgcolor: "#000000", display: "inline-flex"}}>
                        <Toolbar variant="regular">
                            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                Iris
                            </IconButton>
                            { account === null ? 'No Iris node connected' :
                            <div className="menu-items">
                                <Typography variant="h6" color="inherit" component="div" 
                                    sx={{padding: "30px", fontSize: "16px"}}>
                                    <Link to="/upload" className="menu-link">
                                        Upload
                                    </Link>
                                </Typography>
                                <Typography variant="h6" color="inherit" component="div" 
                                    sx={{padding: "30px", fontSize: "16px"}}>
                                    <Link to='/assets' className="menu-link">
                                        Asset Details
                                    </Link>
                                </Typography>
                                {account.address}
                                <FontAwesomeIcon 
                                    icon={faCopy} 
                                    onClick={() => navigator.clipboard.writeText(account.address)}
                                />
                            </div>
                            }
                            {
                                <div className="ipfs-info-container">
                                    { ipfs === null ? 
                                    <span>No IPFS node detected. Please configure a node.</span> : 
                                    <div>IPFS ready</div> }
                                </div>
                            }
                        </Toolbar>
                    </AppBar>

                    <Routes>
                        <Route exact path="/assets/"
                            element={
                                <AssetClassDetailsView
                                    account={ account }
                                    api={ api }
                                    emit={ handleEvent }
                                    ipfs={ ipfs }
                                />
                            }>
                        </Route>
                        <Route exact path="/upload"
                            element={
                                <UploadView
                                    account={ account }
                                    alice={ alice }
                                    api={ api }
                                    emit={ handleEvent }
                                    ipfs={ ipfs }
                                    ipfsHost={ ipfsHost }
                                />
                            }>
                        </Route>
                    </Routes>
                </div>
                <div className="body">
                    { ipfs === null ?
                    <div>
                        <span>Configure IPFS Host and Port</span>
                        <div className="section">
                            <form className="login-form">
                                <div className="form-field-container">
                                    <TextField 
                                        className="login-form-field" 
                                        label="Host" 
                                        variant="outlined" 
                                        onChange={(e) => {
                                            setIpfsHost(e.target.value);
                                            localStorage.setItem('ipfsHost', e.target.value);
                                        }}
                                    />
                                    <TextField 
                                        className="login-form-field"
                                        label="Port"
                                        variant="outlined"
                                        onChange={ (e) => {
                                            setIpfsPort(e.target.value);
                                            localStorage.setItem('ipfsPort', e.target.value);
                                        }} 
                                    />
                                </div>
                                <Button 
                                    className="login-form-button login-submit-btn" 
                                    variant="contained"
                                    color="primary" 
                                    onClick={() => handleIpfsConnect(ipfsHost, ipfsPort)} 
                                > Connect 
                                </Button>
                            </form>
                        </div>
                    </div> :
                    <div></div>
                }
                </div>
            </div>
        </div>
    );
}
