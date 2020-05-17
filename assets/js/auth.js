import zlib from 'zlib';


export default class Auth {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;

        this.wasm = null;
    }

    init(wasm) {
        this.wasm = wasm;
    }

    toObject() {
        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey,
        };
    }

    importObject(obj) {
        this.privateKey = obj.privateKey;
        this.publicKey = obj.publicKey;
    }

    load() {
        if (localStorage.auth) {
            var data = JSON.parse(localStorage.auth);
            this.privateKey = data.privateKey;
            this.publicKey = data.publicKey;
        }
    }

    save() {
        localStorage.auth = JSON.stringify({
            privateKey: this.privateKey,
            publicKey: this.publicKey,
        });
    }

    isAuthenticated() {
        return this.privateKey && this.publicKey;
    }

    checkKeys() {
        return this.wasm.check_keys(this.privateKey, this.publicKey);
    }

    checkPassword(password) {
        if (password.length < 12) {
            return {
                success: false,
                error: "Password must contain at least 12 symbols."
            };
        }
        if (!(password.match(/[a-z]/))) {
            return {
                success: false,
                error: "Password does not contain lowercase symbols."
            };
        }
        if (!(password.match(/[A-Z]/))) {
            return {
                success: false,
                error: "Password does not contain uppercase symbols."
            };
        }
        if (!(password.match(/[0-9]/))) {
            return {
                success: false,
                error: "Password does not contain digits."
            };
        }
        if (!(password.match(/^[a-zA-Z0-9]{12,}$/))) {
            return {
                success: false,
                error: "Allow symbols are: uppercase and lowercase latin letters, digits."
            };
        }
        return {
            success: true,
            error: null
        };
    }

    login(username, password) {
        var secret = `${username}:${password}`;
        this.privateKey = this.wasm.get_private_key(secret);
        this.publicKey = this.wasm.get_public_key(this.privateKey);
    }

    logout() {
        delete localStorage.auth;
    }

    encrypt(data) {
        var compressed = this._compress(data);
        return this.wasm.encrypt(this.publicKey, compressed);
    }

    decrypt(block) {
        var compressed = this.wasm.decrypt(this.privateKey, block);
        return this._decompress(compressed);
    }

    buildSignature(key, block) {
        return this.wasm.build_signature(this.privateKey, key, block);
    }

    checkSignature(key, block, signature) {
        return this.wasm.check_signature(this.publicKey, key, block, signature);
    }

    buildSecretSignature(secret) {
        return this.wasm.build_secret_signature(this.privateKey, secret);
    }

    checkSecretSignature(secret, secretSignature) {
        return this.wasm.check_secret_signature(this.publicKey, secret, secretSignature);
    }

    _compress(s) {
        return zlib.gzipSync(new Buffer(s)).toString('base64');
    }

    _decompress(s) {
        return zlib.unzipSync(Buffer.from(s, 'base64')).toString();
    }
}
