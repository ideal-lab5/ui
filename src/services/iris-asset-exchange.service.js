/**
 * 
 * @param {*} contractPromise 
 * @param {*} mint_quantity 
 * @param {*} asset_price 
 */
export async function call_publishTokenSale(
    contractPromise, account, value, gasLimit, assetId, mintQuantity, assetPrice, callback
) {
    await contractPromise.tx
        .publishSale({ value, gasLimit }, assetId, mintQuantity, assetPrice)
        .signAndSend(account, result => callback(result));
}

export async function read_registry(
    api, abi, account, address, callback,
) {
    api.tx.contracts
    .call(address, 0, 30000000, abi.messages.getVersion)
    .signAndSend(account, result => callback(result));
    // return contractPromise.read('getVersion');
    // return contractPromise.query.getVersion(account.address, {gasLimit: 30000000});
}