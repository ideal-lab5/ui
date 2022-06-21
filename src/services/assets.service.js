export async function query_assetClassDetails(
    api, assetId, callback
) {
    return api === null ? null :
        api.query.assets.asset(assetId, result => callback(result));
}

export async function query_account(
    api, account, assetId, callback
) {
    return api === null ? null :
        api.query.assets.account(assetId, account.address,
            result => callback(result));
}