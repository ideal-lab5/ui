import { useEffect, useState } from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { create } from 'ipfs-http-client';
import * as IPFS from 'ipfs-core'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link,
  } from "react-router-dom";

import './home.component.css';
import { Snackbar } from "@mui/material";
import Alert from '@mui/material/Alert';
import UploadView from "../upload/upload.component";
import AssetClassDetailsView from "../assets/asset-class-details.component";
import AssetClassDetailView from "../assets/asset-class-detail/asset-class-detail.component";

export default function Home(props) {

    const [ipfs, setIpfs] = useState(null);
    const [api, setApi] = useState(null);
    const [account, setAccount] = useState(null);
    const [alice, setAlice] = useState(null);

    const initializeApi = async () => {
        const host = props.host;
        const port = props.port;
  
        const provider = new WsProvider(`ws://${host}:${port}`);
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
                        // TODO: explore changing secretKey type to [u8;32]
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
        const alice = keyring.addFromUri('//Alice');
        setAccount(account);
        setAlice(alice);
    }

    const initializeIpfs = async () => {
        // TODO: error handling
        // const host = process.env.IPFS_HOST;
        const  host = '127.0.0.1';
        // const port = process.env.IPFS_PORT;
        const port = 5002;
        // console.log("IPFS_PORT IS " + port);

        // if (host === null) {
        //     console.error("Must specify the IPFS_HOST environment variable when starting this applicaiton.");
        // } else 
        // if (port === null) {
        //     console.error("Must specify the IPFS_PORT environment variable when starting this applicaiton.");
        // } else {
        const ipfs = await create({
            host: host,
            port: port,
            protocol: 'http',
        });
        setIpfs(ipfs);
        // }
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
            initializeIpfs();
        }
    }, []);

    return (
        <div className="container">
            <div>
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} 
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
                                <FontAwesomeIcon icon={faCopy} />
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
                        <Route exact path="/assets/:assetId"
                            element={
                                <AssetClassDetailView
                                    account={ account }
                                    alice={ alice }
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
                                    api={ api }
                                    emit={ handleEvent }
                                    ipfs={ ipfs }
                                />
                            }>
                        </Route>
                    </Routes>
                </div>
            </div>
        </div>
    );
}
