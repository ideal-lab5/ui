// Functions to Call Extrinsics
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
    // this.download(res, message);
  }

// Functions to Query Runtime Storage
// read AssetClassOwnership by account id
export async function query_AssetClassOwnership_by_AccountId(
    api, address, subscription_callback
) {
    return api === null ? null : 
        await api.query.irisAssets.assetClassOwnership.entries(address, (assetAccess) =>
            subscription_callback(assetAccess)
        );
}

export async function query_AssetClassOwnership_by_AccountIdAndAssetId(
    api, address, assetId, 
    success_callback, error_callback
) {
    await api.query.irisAssets.assetClassOwnership(address, assetId)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
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
