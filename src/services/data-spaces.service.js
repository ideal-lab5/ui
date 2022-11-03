export async function create_dataspace(
    api, account, id, name, existential_deposit,
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataSpaces.create(
        account.address, name, id, existential_deposit,
    ).signAndSend(account, result => {
        if (result.status.isInBlock) {
            isInBlockCallback(result);
        } else if (result.status.isFinalized) {
            isFinalizedCallback(result);
        }
    });
}

export async function call_mint_dataspace_access(
    api, account, beneficiary, id, amount,
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataSpaces.mint(
        beneficiary, id, amount,
    ).signAndSend(account, result => {
        if (result.status.isInBlock) {
            isInBlockCallback(result);
        } else if (result.status.isFinalized) {
            isFinalizedCallback(result);
        }
    });
}

export async function query_metadata(
    api, assetId, subscriptionCallback,
) {
    return api === null ? null : 
        api.query.dataSpaces.metadata(assetId, (dataspacesMetadata) => 
            subscriptionCallback(dataspacesMetadata)
        );

}