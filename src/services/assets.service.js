export async function query_assetClassDetails(
    api, assetId, callback
) {
    return api === null ? null :
        api.query.assets.asset(assetId, result => callback(result));
}