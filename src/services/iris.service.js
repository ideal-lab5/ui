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
    api, account, beneficiary, cid, amount, 
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .mintTickets(beneficiary, cid, amount)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}

export async function requestData(
    api, account, owner, cid, 
    logs_callback, success_callback, error_callback
) {
    await api.tx.iris
        .requestData(owner, cid)
        .signAndSend(account, logs_callback)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}