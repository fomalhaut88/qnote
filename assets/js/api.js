import axios from 'axios';


export default class Api {
    constructor() {
        this._auth = null;

        // this._http = axios.create({
        //     baseURL: `http://hashstorage.fomalhaut.su/api/`,
        //     headers: {
        //         'Access-Control-Allow-Origin': "*",
        //     },
        // });
        this._http = axios.create({
            baseURL: `/api/`,
        });
    }

    init(auth) {
        this._auth = auth;
    }

    list(callback) {
        this._http.post("list", {
            public_key: this._auth.publicKey,
        }).then(response => {
            var data = response.data.map(item => this._extractData(item));
            callback(data);
        });
    }

    get(key, callback) {
        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_key: key,
        }).then(response => {
            var data = this._extractData(response.data);
            callback(data);
        });
    }

    save(key, data, callback) {
        var handler = (secret, callback) => {
            var block = this._auth.encrypt(data);
            var signature = this._auth.buildSignature(key, block);
            var secretSignature = secret ? this._auth.buildSecretSignature(secret) : "";

            this._http.post("save", {
                public_key: this._auth.publicKey,
                data_key: key,
                data_block: block,
                signature: signature,
                secret_signature: secretSignature,
            }).then(response => {
                if (callback) {
                    callback();
                }
            }, response => {
                throw new Error("Failed to save block.");
            });
        };

        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_key: key,
        }).then(response => {
            handler(response.data.secret, callback);
        }, response => {
            handler("", callback);
        });
    }

    delete(key, callback) {
        this._http.post("get", {
            public_key: this._auth.publicKey,
            data_key: key,
        }).then(response => {
            var secret = response.data.secret;
            var secretSignature = this._auth.buildSecretSignature(secret);

            this._http.post("delete", {
                public_key: this._auth.publicKey,
                data_key: key,
                secret_signature: secretSignature,
            }).then(response => {
                if (response.data.success) {
                    if (callback) {
                        callback();
                    }
                } else {
                    throw new Error("Failed to delete block.");
                }
            });
        });
    }

    _extractData(item) {
        var block = item.data_block;
        if (this._auth.checkSignature(item.data_key, block, item.signature)) {
            var data = this._auth.decrypt(block);
            return { key: item.data_key, data: data };
        } else {
            throw new Error("Invalid signature.");
        }
    }
}
