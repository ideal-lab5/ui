import { useEffect, useState } from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { create } from 'ipfs-http-client';
import * as IPFS from 'ipfs-core'

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
import { getLinkUtilityClass, Snackbar } from "@mui/material";
import Alert from '@mui/material/Alert';
import UploadView from "../upload/upload.component";
import AssetClassDetailsView from "../assets/asset-class-details.component";

export default function Home(props) {

    const [ipfs, setIpfs] = useState(null);
    const [api, setApi] = useState(null);
    const [account, setAccount] = useState(null);

    const initializeApi = async () => {
        const host = props.host;
        const port = props.port;
  
        const provider = new WsProvider(`ws://${host}:${port}`);
        const api = await ApiPromise.create({
            provider,
            rpc: {
              iris: {
                encrypt: {
                    description: 'Add bytes to IPFS through the Iris gateway',
                    params: [
                        {
                            name: 'byte_stream',
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
              }
            }
        });
        await api.isReady;
        setApi(api);
        const keyring = new Keyring({ type: 'sr25519' });
        const account = keyring.addFromUri('//' + props.address);
        setAccount(account);
    }

    const initializeIpfs = async () => {
        const ipfs = await create({
            host: '127.0.0.1',
            port: 5002,
            protocol: 'http',
          });
        setIpfs(ipfs);
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
                        sx={{bgcolor: "gray", display: "inline-flex"}}>
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
