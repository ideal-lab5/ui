// call extrinsics
export async function call_registerRule(
    api, account, ruleExecutorContractAddress, assetId, success_callback,
) {
    await api.tx.authorization
        .registerRule(assetId, ruleExecutorContractAddress)
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                success_callback(result)
            }
        });
}

export async function call_ruleExecutor(
    contractPromise, account, value, gasLimit, assetId, publicKey,
    isInBlockCallback, errorHandler,
) {
    await contractPromise.tx
    .execute({ value, gasLimit }, assetId, publicKey)
        .signAndSend(account, result => {
            if (result.isInBlock) {
                isInBlockCallback(result);
            }
        }, err => {
            errorHandler(err);
        });
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
