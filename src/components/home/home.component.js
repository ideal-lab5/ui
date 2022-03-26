import { useEffect, useState } from "react";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { create } from 'ipfs-http-client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link
  } from "react-router-dom";
import ContentManagementView from "../content-management/content-management.component";
import LibraryView from "../library/library.component";
import StorageManagementView from "../storage-management/storage-management.component";
import AssetExchangeView from "../apps/asset-exchange/asset-exchange.component";

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
        setApi(api);
        const keyring = new Keyring({ type: 'sr25519' });
        const account = keyring.addFromUri('//' + props.address);
        setAccount(account);
    }

    const initializeIpfs = async () => {
        const ipfs = await create({
            host: 'localhost',
            port: 5001,
            protocol: 'http',
          });
        setIpfs(ipfs);
    }


    useEffect(() => {
        if (props.port) {
            initializeApi();
            initializeIpfs();
        }
    }, []);

    return (
        <div className="container">
            <div>
                <div>
                    <AppBar position="fixed" 
                        sx={{bgcolor: "white", display: "inline-flex"}}>
                        <Toolbar variant="regular">
                            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                Iris
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div" 
                                sx={{padding: "30px", fontSize: "16px"}}>
                                <Link to="/content-management">Content Management</Link>
                            </Typography>
                            <Typography variant="h6" color="inherit" component="div"
                                sx={{padding: "30px", fontSize: "16px"}}>
                                <Link to="/library">Library</Link>
                            </Typography>
                            <Typography variant="h6" color="inherit" component="div"
                                sx={{padding: "30px", fontSize: "16px"}}>
                                <Link to="/storage-management">Storage Management</Link>
                            </Typography>
                            <Typography variant="h6" color="inherit" component="div"
                                sx={{padding: "30px", fontSize: "16px"}}>
                                <Link to="/apps">Apps</Link>
                            </Typography>
                            { account === null ? '' : account.address }
                        </Toolbar>
                    </AppBar>

                    <Routes> 
                        <Route exact path="/content-management"
                            element={
                                <ContentManagementView
                                account={ account }
                                api={ api }
                                ipfs={ ipfs }
                            />
                            }>
                        </Route>
                        <Route exact path="/Library" 
                        element={
                            <LibraryView
                                account={ account }
                                api={ api }
                            />
                        } />
                        <Route exact path="/storage-management"
                            element={
                                <StorageManagementView
                                    account={ account }
                                    api={ api }
                                />
                            } />
                        <Route exact path="/apps" 
                            element={
                                <AssetExchangeView
                                    account={ account }
                                    api={ api }
                                />
                            }/>
                    </Routes>
                </div>
            </div>
        </div>
    );
}