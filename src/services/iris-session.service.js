// call extrinsics
export async function call_joinStoragePool(
    api, account, assetId,
    logs_callback, success_callback, error_callback,
) {
    await api.tx.irisSession
        .joinStoragePool(account.address, assetId)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

// query runtime storage
export async function query_StorageProviders_by_AssetId(
    api, assetId,
    success_callback, error_callback
) {
    await api.query.irisSession
        .storageProviders(assetId)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

// I have a feeling this is going to be a costly function
// This will need to be updated to scale
export async function query_StorageProviders(
    api, success_callback, error_callback
) {
    // get all storage providers
    await api.query.irisSession
        .storageProviders.entries()
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}