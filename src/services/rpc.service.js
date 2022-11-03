import { ApiBase } from "@polkadot/api/base";

export async function encrypt(
    api, plaintext, signature, signer, message, proxy,
    success_callback, error_callback,
) {
    if (api !== null) {
        await api.rpc.iris.encrypt(
            plaintext, signature, signer, message, proxy,
        )
        .then(res => success_callback(res))
        .catch(err => error_callback(err));
    } else {
        console.log('API IS NULL');
    }
}