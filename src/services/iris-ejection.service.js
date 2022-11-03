// call extrinsics
export async function call_registerRule(
    api, account, ruleAddress, assetId, success_callback,
) {
    await api.tx.irisEjection
        .registerRule(assetId, ruleAddress)
        .signAndSend(account, result => success_callback(result));
}

export async function query_registry(
    api, assetId, success_callback,
) {
    return api === null ? null :
        await api.query.authorization
            .registry(assetId, (result) => 
                success_callback(result)
            );
}
