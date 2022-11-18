/**
 * Call the 'iris_encrypt' RPC endpoint
 * 
 * @param {*} api 
 * @param {*} plaintext 
 * @param {*} signature 
 * @param {*} signer 
 * @param {*} message 
 * @param {*} proxy 
 * @param {*} success_callback 
 * @param {*} error_callback 
 * @returns 
 */
export async function encrypt(
    api, plaintext, signature, signer, message, proxy,
    success_callback, error_callback,
) {
    return api === null ? null :
        await api.rpc.iris.encrypt(
            plaintext, 
            signature, 
            signer, 
            message, 
            proxy,
        ).then(res => success_callback(res))
        .catch(err => error_callback(err));
}

/**
 * Call the 'iris_decrypt' RPC endpoint
 * 
 * @param {*} api 
 * @param {*} signature 
 * @param {*} signer 
 * @param {*} message 
 * @param {*} ciphertext 
 * @param {*} assetId 
 * @param {*} secretKey 
 * @returns 
 */
export async function decrypt(
    api, signature, signer, message, ciphertext, assetId, secretKey,
    successCallback, errorCallback,
) {
    return api === null ? null : 
        await api.rpc.iris.decrypt(
            ciphertext,
            signature,
            signer,
            message,
            assetId,
            secretKey,
        ).then(res => successCallback(res))
        .catch(err => errorCallback(err));
}