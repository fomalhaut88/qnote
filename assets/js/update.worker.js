import Auth from './auth';
import Api from './api';
import LazyUpdater from './lazy_updater';

importScripts("../hash-storage-wasm/hash_storage_wasm.js?v=0.3");


wasm_bindgen("../hash-storage-wasm/hash_storage_wasm_bg.wasm").then(() => {
    var workspaceVersionCache = {};


    /* sendError */

    var sendError = err => {
        self.postMessage({ type: "error", error: err });
    };


    /* compareVersions */

    var compareVersions = (localVerion, remoteVersion) => {
        return !localVerion || !remoteVersion || (localVerion == remoteVersion);
    };


    /* incrementVersion */

    var incrementVersion = version => {
        if (!version) {
            version = "0";
        }
        return (parseInt(version) + 1).toString();
    };


    /* cleanQueue */

    var cleanQueue = queue => {
        var cleaned = [];
        var updateWorkspaceMap = {};
        queue.forEach((item, idx) => {
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


    /* loopQueue */

    var loopQueue = (queue, handler, callback, idx) => {
        if (idx === undefined) {
            idx = 0;
        }
        if (idx >= queue.length) {
            callback();
        } else {
            handler(queue[idx], () => {
                loopQueue(queue, handler, callback, idx + 1);
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
                    sendError("Server error.");
                    callback();
                });
            } else {
                // Save workspace function
                var saveWorkspace = (key, data, version, callback) => {
                    api.save(key, data, version, callback, err => {
                        console.error(err);
                        sendError("Server error.");
                        callback();
                    });
                };

                // Getting workspace version from workspaceVersionCache if it exists
                // else take the version provided by the state (item.data.version)
                var version = workspaceVersionCache[item.data.workspaceId] ?
                              workspaceVersionCache[item.data.workspaceId] :
                              item.data.version;

                // We compare version on update only
                if (item.data.action == 'update') {
                    api.get(key, workspaceData => {
                        // Checking local and remove versions
                        var match = compareVersions(version, workspaceData.version);

                        // If they match, increment the local version and save the data
                        // else ask the client to reload the page.
                        if (match) {
                            version = incrementVersion(version);
                            saveWorkspace(key, data, version, () => {
                                workspaceVersionCache[item.data.workspaceId] = version;
                                callback();
                            });
                        } else {
                            sendError("Remote version does not match. Reload the page.");
                        }
                    });
                } else {
                    saveWorkspace(key, data, version, callback);
                }
            }
        } else {
            api.save(key, data, "", callback, err => {
                console.error(err);
                sendError("Server error.");
                callback();
            });
        }
    };


    /* updater */

    var updater = new LazyUpdater((queue, callback) => {
        self.postMessage({ type: "status", isPerforming: true });
        var cleaned = cleanQueue(queue);
        loopQueue(cleaned, performItem, () => {
            self.postMessage({ type: "status", isPerforming: false });
            callback();
        });
    }, 1000);
    updater.start();


    /* addEventListener */

    self.addEventListener('message', e => {
        updater.push(e.data);
    });
});
