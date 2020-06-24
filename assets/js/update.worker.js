import Auth from './auth';
import Api from './api';
import LazyUpdater from './lazy_updater';

importScripts("../hash-storage-wasm/hash_storage_wasm.js?v=0.3");


wasm_bindgen("../hash-storage-wasm/hash_storage_wasm_bg.wasm").then(() => {
    /* sendError */

    var sendError = err => {
        self.postMessage({ error: err });
    };


    /* cleanStack */

    var cleanStack = stack => {
        var cleaned = [];
        var updateWorkspaceMap = {};
        stack.forEach((item, idx) => {
            if (item.type == 'workspace') {
                if (item.data.action == 'update') {
                    var workspaceId = item.data.workspace.id;
                    if (workspaceId in updateWorkspaceMap) {
                        cleaned.splice(updateWorkspaceMap[workspaceId], 1);
                    }
                    updateWorkspaceMap[workspaceId] = cleaned.length;
                }
            }
            cleaned.push(item);
        });
        return cleaned;
    };


    /* loopStack */

    var loopStack = (stack, handler, callback, idx) => {
        if (idx === undefined) {
            idx = 0;
        }
        if (idx >= stack.length) {
            callback();
        } else {
            handler(stack[idx], () => {
                loopStack(stack, handler, callback, idx + 1);
            });
        }
    };


    /* performItem */

    var performItem = (item, callback) => {
        // Creating auth and api
        var auth = new Auth();
        auth.importObject(item.auth);
        auth.init(wasm_bindgen);
        var api = new Api();
        api.init(auth);

        // Defining data to store
        var key = (item.type == 'workspace') ? item.data.workspaceId : 'general';
        var data = JSON.stringify((item.type == 'workspace') ? item.data.workspace : item.data);

        // Requests to hashstorage
        if (item.type == 'workspace') {
            if (item.data.action == 'remove') {
                api.delete(key, callback, err => {
                    console.error(err);
                    self.postMessage({ error: "Server error." });
                    callback();
                });
            } else {
                api.save(key, data, callback, err => {
                    console.error(err);
                    self.postMessage({ error: "Server error." });
                    callback();
                });
            }
        } else {
            api.save(key, data, callback, err => {
                console.error(err);
                self.postMessage({ error: "Server error." });
                callback();
            });
        }
    };


    /* updater */

    var updater = new LazyUpdater((stack, callback) => {
        self.postMessage({ isPerforming: true });
        var cleaned = cleanStack(stack);
        loopStack(cleaned, performItem, () => {
            self.postMessage({ isPerforming: false });
            callback();
        });
    }, 1000);
    updater.start();


    /* addEventListener */

    self.addEventListener('message', e => {
        updater.push(e.data);
    });
});
