
// // Functions to Call The RPC Endpoint
// export async function rpc_retrieveBytes(
//     api, assetId, success_callback, error_callback
// ) {
//     await api.rpc.iris.retrieveBytes(assetId)
//         .then(res => success_callback(res))
//         .catch(err => error_callback(err));
// }

import { ApiBase } from "@polkadot/api/base";

// /**
//  * Make a call to the ipfs_addBytes RPC endpoint
//  * 
//  * @param {} api 
//  * @param {*} bytes 
//  * @param {*} asset_id 
//  * @param {*} dataspace_id d
//  * @param {*} balance 
//  * @param {*} signature 
//  * @param {*} signer 
//  * @param {*} message 
//  * @param {*} success_callback 
//  * @param {*} error_callback 
//  */
// export async function rpc_addBytes(
//     api, bytes, asset_id, dataspace_id, balance, signature, signer, message, 
//     success_callback, error_callback,
// ) {
//     if (api !== null) {
//         await api.rpc.ipfs.addBytes(
//             bytes, asset_id, dataspace_id, balance,
//             signature, signer, message,
//         )
//         .then(res => success_callback(res))
//         .catch(err => console.log(err));
//     } else {
//         console.log('API IS NULL');
//     }
// }

export async function encrypt(
    api, plaintext, signature, signer, message, 
    success_callback, error_callback,
) {
    if (api !== null) {
        await api.rpc.iris.encrypt(
            plaintext, signature, signer, message,
        )
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
    } else {
        console.log('API IS NULL');
    }
}