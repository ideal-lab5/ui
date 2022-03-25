/**
 * 
 * @param {*} contractPromise 
 * @param {*} mint_quantity 
 * @param {*} asset_price 
 */
export async function call_publishTokenSale(
    api, abi, contract_address, account, value, gasLimit, assetId, mintQuantity, assetPrice, callback
) {
    // (assetId, mintQuantity, assetPrice)
    await api.tx.contracts
        .call(contract_address, value, gasLimit, abi.messages.publishSale)
        .signAndSend(account, result => callback(result));
}

export async function read_registry(
    api, abi, account, address, callback,
) {
    await api.tx.contracts
    .call(address, 0, 30000000, abi.messages.getVersion)
    .signAndSend(account, result => callback(result));
}