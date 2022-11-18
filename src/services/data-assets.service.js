
/**
 * All functions in this file interact with the DataAssets pallet in Iris.
 */

/**
 * Call the 'createRequest' extrinsic
 * @param {*} api 
 * @param {*} account 
 * @param {*} gatewayAddress 
 * @param {*} cid 
 * @param {*} multiaddress 
 * @param {*} isInBlockCallback 
 * @param {*} isFinalizedCallback 
 */
export async function call_create_request(
    api, account, gatewayAddress, cid, multiaddress,
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataAssets.createRequest(
        // account.address,  // caller's account 
        gatewayAddress,   // gateway account
        0,
        cid,              // CID to be fetched
        multiaddress, 
        1,
    ).signAndSend(account, result => {
        if (result.status.isInBlock) {
            isInBlockCallback(result);
        } else if (result.status.isFinalize) {
            isFinalizedCallback(result);
        }
    });
}

/**
 * Query the asset class's metadata in Iris
 * @param {*} api The polkadotjs Api
 * @param {*} assetId The asset id to query
 * @param {*} subscriptionCallback The callback to handle results
 * @returns the asset class's metadata
 */
export async function query_metadata(
    api, assetId, subscriptionCallback
) {
    return api === null ? null : 
    await api.query.dataAssets.metadata(assetId, (result) => {
        subscriptionCallback(result)
    });
};

export async function query_ingestion_staging(
    api, account, subscriptionCallback,
) {
    return api == null || account === null ? null : 
        await api.query.dataAssets.ingestionStaging(account.address, (result) => 
            subscriptionCallback(result)
        );
}