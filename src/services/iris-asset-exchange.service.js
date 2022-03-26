export async function call_publishTokenSale(
    contractPromise, account, value, gasLimit, assetId, mintQuantity, assetPrice, callback
) {
    await contractPromise.tx
        .publishSale({ value, gasLimit }, assetId, mintQuantity, assetPrice)
        .signAndSend(account, result => callback(result));
}

export async function call_purchaseTokens(
    contractPromise, account, value, gasLimit, assetId, amount,
) {
    
}

export async function read_registry(
    contractPromise, account, callback,
) {
    await contractPromise.query
        .getVersion(account.address, { value: 0, gasLimit: 3000000 })
        .signAndSend(account, result => callback(result));
}