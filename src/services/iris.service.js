export async function createStorageAsset(
    api, account, multiAddress, cid, name, assetId, balance,
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .createStorageAsset(
            account.address, multiAddress, cid, name, assetId, balance
        )
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
    }

export async function mintTickets(
    api, account, beneficiary, asset_id, amount, 
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .mintTickets(beneficiary, asset_id, amount)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

export async function requestData(
    api, account, owner, assetId, 
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .requestData(owner, assetId)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

export async function initializeStorageCapacityAssetClass(
    api, account, assetId, balance, amount,
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .initStorageCapacityAssetClass(account.address, assetId, balance, amount)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

export async function requestLeaseStorageAsset(
    api, account, storageProviderAssetId, storageProviderAddress,
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .requestLeaseStorageAsset(account.address, storageProviderAssetId, storageProviderAddress)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}