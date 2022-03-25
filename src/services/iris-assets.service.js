// Functions to Call Extrinsics
/**
 * Call the IrisAssets::create extrinsic
 * @param {} api 
 * @param {*} account 
 * @param {*} multiAddress 
 * @param {*} cid 
 * @param {*} name 
 * @param {*} assetId 
 * @param {*} balance 
 * @param {*} success_callback 
 */
export async function call_create(
    api, account, multiAddress, cid, name, assetId, balance,
    success_callback,
) {
    await api.tx.irisAssets
        .create(
            account.address, 
            multiAddress, 
            cid, 
            name, 
            assetId,
            balance
        )
        .signAndSend(account, result => success_callback(result));
    }

/**
 * Call the IrisAssets::mint extrinsic
 * @param {*} api 
 * @param {*} account 
 * @param {*} beneficiary 
 * @param {*} assetId 
 * @param {*} amount 
 * @param {*} success_callback 
 */
export async function call_mint(
    api, account, beneficiary, assetId, amount, success_callback,
) {
    await api.tx.irisAssets
        .mint(beneficiary, assetId, amount)
        .signAndSend(account, result => success_callback(result));
}

export async function call_requestBytes(
    api, account, owner, assetId, 
    logs_callback, success_callback, error_callback
) {
    await api.tx.irisAssets
        .requestBytes(owner, assetId)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

// Functions to Call The RPC Endpoint
export async function rpc_retrieveBytes(
    api, message, success_callback, error_callback
) {
    await api.rpc.iris.retrieveBytes(message)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
  }

// Functions to Query Runtime Storage
// read AssetClassOwnership by account id
export async function query_AssetClassOwnership(
    api, address, subscription_callback
) {
    return api === null ? null : 
        await api.query.irisAssets.assetClassOwnership(address, assetAccess =>
            subscription_callback([assetAccess])
        );
}

export async function query_Metadata_by_AssetId(
    api, asset_id, subscription_callback,
) {
    return api === null ? null : 
        await api.query.irisAssets.metadata.entries(asset_id, (metadata) =>
            subscription_callback(metadata)
        );
}

// read AssetAccess by account id
// TODO: but hold on... this really shouldn't be public knowledge (though by design it is...)
// that may be something to address in the future
export async function query_AssetAccess_by_AccountId(
    api, address, subscription_callback) {
    return api === null ? null : 
        api.query.irisAssets.assetAccess.entries(address, (assetAccess) => 
            subscription_callback(assetAccess)
        );
}

export async function query_AssetIds(
    api, subscription_callback
) {
    return api === null ? null : 
        api.query.irisAssets.assetIds((assetIds) => 
            subscription_callback(assetIds)
        );
}
