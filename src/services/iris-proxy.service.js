/**
 * Query on-chain reencryption artifacts.
 * The existence of this data implies that either
 *  a) Validators are authorized to generate capsule fragments for the consumer
 *  b) Validators have already generated cfrags and the consumer can decrypt the data.
 * 
 * @param {*} api 
 * @param {*} account 
 * @param {*} publicKey 
 * @returns 
 */
export async function query_ReencryptionArtifacts(
    api, account, publicKey, callback,
) {
    return api === null || account === null ? null :
        await api.query.irisProxy
            .reencryptionArtifacts(account.address, publicKey,
                result => {
                    callback(result);
                });
}

export async function query_CapsuleFragments(
    api, account, publicKey, callback,
) {
    return api === null || account === null ? null :
        await api.query.irisProxy
            .encryptedCapsuleFrags(account.address, publicKey, 
                result => {
                    callback(result);
                })
}