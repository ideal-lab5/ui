// Functions to Call Extrinsics
export async function call_create(
    api, account, multiAddress, cid, dataspaceId, assetId, balance,
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataAssets
        .create(
            account.address, 
            multiAddress, 
            cid,
            dataspaceId,
            assetId,
            balance
        )
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                isInBlockCallback(result);
            } else if (result.status.isFinalized) {
                isFinalizedCallback(result);
            }
        });
    }

export async function call_mint(
    api, account, beneficiary, assetId, amount, 
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataAssets
        .mint(beneficiary, assetId, amount)
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                isInBlockCallback(result);
            } else if (result.status.isFinalized) {
                isFinalizedCallback(result);
            }
        });
}

export async function call_requestBytes(
    api, account, assetId, 
    isInBlockCallback, isFinalizedCallback,
) {
    await api.tx.dataAssets
        .requestBytes(assetId)
        .signAndSend(account, result => {
            if (result.status.isInBlock) {
                isInBlockCallback(result);
            } else if (result.status.isFinalized) {
                isFinalizedCallback(result);
            }
        });
}

// Functions to Call The RPC Endpoint
export async function rpc_retrieveBytes(
    api, assetId, success_callback, error_callback
) {
    await api.rpc.iris.retrieveBytes(assetId)
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
  }

// Functions to Query Runtime Storage
// read AssetClassOwnership by account id
export async function query_AssetClassOwnership(
    api, address, subscription_callback
) {
    return api === null ? null : 
        await api.query.dataAssets.assetClassOwnership(address, assetAccess =>
            subscription_callback([assetAccess])
        );
}

export async function query_Metadata_by_AssetId(
    api, asset_id, subscription_callback,
) {
    return api === null ? null : 
        await api.query.dataAssets.metadata(asset_id, (metadata) =>
            subscription_callback(metadata)
        );
}

// read AssetAccess by account id
// TODO: but hold on... this really shouldn't be public knowledge (though by design it is...)
// that may be something to address in the future
export async function query_AssetAccess_by_AccountId(
    api, address, subscription_callback) {
    return api === null ? null : 
        api.query.dataAssets.assetAccess(address, (assetAccess) => 
            subscription_callback(assetAccess)
        );
}

export async function query_AssetIds(
    api, subscription_callback
) {
    return api === null ? null : 
        api.query.dataAssets.assetIds((assetIds) => 
            subscription_callback(assetIds)
        );
}
