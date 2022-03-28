export async function call_publishTokenSale(
    contractPromise, account, value, gasLimit, assetId, mintQuantity, assetPrice,
    isInBlockCallback, isFinalizedCallback
) {
    await contractPromise.tx
        .publishSale({ value, gasLimit }, assetId, mintQuantity, assetPrice)
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                isInBlockCallback(result);
            } else if (result.status.isFinalized) {
                isFinalizedCallback(result);
            }
        });
}

export async function call_purchaseTokens(
    contractPromise, account, value, gasLimit, assetId, quantity,
    isInBlockCallback, isFinalizedCallback
) {
    await contractPromise.tx
        .purchaseTokens({ value, gasLimit }, assetId, quantity)
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                isInBlockCallback(result);
            } else if (result.status.isFinalized) {
                isFinalizedCallback(result);
            }
        });
}
