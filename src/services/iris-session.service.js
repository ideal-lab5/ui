// call extrinsics
export async function call_joinStoragePool(
    api, account, assetId, success_callback,
) {
    await api.tx.irisSession
        .joinStoragePool(account.address, assetId)
        .signAndSend(account, result => success_callback(result));
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
    api, subscription_callback
) {
    // get all storage providers
    return api === null ? null : 
        await api.query.irisSession.storageProviders.entries(sp => 
            subscription_callback(sp)
        );
}

export async function query_CurrentEra(
    api, subscription_callback
) {
    return api === null ? null :
        await api.query.irisSession.currentEra(eraIndex => 
            subscription_callback(eraIndex)
        );
}

export async function query_ActiveEra(
    api, subscription_callback
) {
    return api === null ? null : 
        await api.query.irisSession.activeEra(eraIndex =>
            subscription_callback(eraIndex)
        );
}

export async function query_ErasRewardPoints(
    api, subscription_callback
) {
    return api === null ? null :
        await api.query.irisSession.erasRewardPoints.entries((erasRewardPoints) =>
            subscription_callback(erasRewardPoints)
        );
}

export async function query_RewardPoints_by_Era(
    api, eraIndex,
    success_callback, error_callback
) {
    await api.query.irisSession 
        .erasRewardPoints.entries(eraIndex)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
}
