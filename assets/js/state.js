import LazyUpdater from './lazy_updater';


export default class State {
    constructor() {
        this._data = null;
        this._workspaces = {};

        this._auth = null;
        this._api = null;
        this._worker = null;
    }

    init(auth, api, worker) {
        this._auth = auth;
        this._api = api;
        this._worker = worker;

        this._load();
    }

    isReady() {
        return (this._data !== null) && (Object.keys(this._workspaces).length > 0);
    }

    getGeneralData() {
        return this._data;
    }

    getWorkspaces() {
        return this._workspaces;
    }

    getWorkspace(workspaceId) {
        return this._workspaces[workspaceId];
    }

    getActiveWorkspaceId() {
        return this._data.activeWorkspaceId;
    }

    setActiveWorkspace(workspaceId) {
        this._data.activeWorkspaceId = workspaceId;
        this._changedData();
    }

    isActiveWorkspace(workspaceId) {
        return workspaceId == this._data.activeWorkspaceId;
    }

    renameWorkspace(workspaceId, name) {
        this._workspaces[workspaceId].name = name;
        this._changedWorkspace(workspaceId);
    }

    addWorkspace(name) {
        var workspaceId = this._genWorkspaceId();
        this._workspaces[workspaceId] = {
            id: workspaceId,
            name: name,
            tabs: [],
            activeTabIdx: null,
        };
        this._ensureTab(workspaceId);
        this._changedWorkspace(workspaceId, 'add');
        return workspaceId;
    }

    removeWorkspace(workspaceId) {
        delete this._workspaces[workspaceId];
        this._ensureWorkspace();
        this._changedWorkspace(workspaceId, 'remove');
    }

    getActiveTabIdx(workspaceId) {
        return this._workspaces[workspaceId].activeTabIdx;
    }

    getTabs(workspaceId) {
        return this._workspaces[workspaceId].tabs;
    }

    getTab(workspaceId, tabIdx) {
        return this._workspaces[workspaceId].tabs[tabIdx];
    }

    setActiveTab(workspaceId, tabIdx) {
        this._workspaces[workspaceId].activeTabIdx = tabIdx;
        this._changedWorkspace(workspaceId);
    }

    isActiveTab(workspaceId, tabIdx) {
        return this._workspaces[workspaceId].activeTabIdx == tabIdx;
    }

    updateTabContent(workspaceId, tabIdx, content) {
        this._workspaces[workspaceId].tabs[tabIdx].content = content;
        this._changedWorkspace(workspaceId);
    }

    moveLeftTab(workspaceId, tabIdx) {
        if (tabIdx > 0) {
            var swap = this._workspaces[workspaceId].tabs[tabIdx];
            this._workspaces[workspaceId].tabs[tabIdx] = this._workspaces[workspaceId].tabs[tabIdx - 1];
            this._workspaces[workspaceId].tabs[tabIdx - 1] = swap;

            if (tabIdx == this._workspaces[workspaceId].activeTabIdx) {
                this._workspaces[workspaceId].activeTabIdx--;
            }
            if (tabIdx == this._workspaces[workspaceId].activeTabIdx + 1) {
                this._workspaces[workspaceId].activeTabIdx++;
            }
        }
    }

    moveRightTab(workspaceId, tabIdx) {
        if (tabIdx < this._workspaces[workspaceId].tabs.length - 1) {
            var swap = this._workspaces[workspaceId].tabs[tabIdx];
            this._workspaces[workspaceId].tabs[tabIdx] = this._workspaces[workspaceId].tabs[tabIdx + 1];
            this._workspaces[workspaceId].tabs[tabIdx + 1] = swap;

            if (tabIdx == this._workspaces[workspaceId].activeTabIdx) {
                this._workspaces[workspaceId].activeTabIdx++;
            }
            if (tabIdx == this._workspaces[workspaceId].activeTabIdx - 1) {
                this._workspaces[workspaceId].activeTabIdx--;
            }
        }
    }

    renameTab(workspaceId, tabIdx, name) {
        this._workspaces[workspaceId].tabs[tabIdx].name = name;
        this._changedWorkspace(workspaceId);
    }

    addTab(workspaceId) {
        var tab = {
            name: "Untitled",
            content: "",
        };
        var workspace = this._workspaces[workspaceId];
        var tabIdx = workspace.tabs.length;
        workspace.tabs.push(tab);
        this._changedWorkspace(workspaceId);
        return tabIdx;
    }

    removeTab(workspaceId, tabIdx) {
        this._workspaces[workspaceId].tabs.splice(tabIdx, 1);
        this._ensureTab(workspaceId);
        this._changedWorkspace(workspaceId);
    }

    _genWorkspaceId() {
        return Math.random().toString().substring(2);
    }

    _ensureWorkspace() {
        var workspaces = this.getWorkspaces();
        var activeWorkspaceId = this.getActiveWorkspaceId();

        if (Object.keys(workspaces).length == 0) {
            var workspaceId = this.addWorkspace("Untitled");
            this._ensureTab(workspaceId);
        }

        if ((activeWorkspaceId === null) || !(activeWorkspaceId in workspaces)) {
            var workspaceId = Object.keys(workspaces)[0];
            this.setActiveWorkspace(workspaceId);
        }
    }

    _ensureTab(workspaceId) {
        var tabs = this.getTabs(workspaceId);
        var activeTabIdx = this.getActiveTabIdx(workspaceId);

        if (tabs.length == 0) {
            var tabIdx = this.addTab(workspaceId);
            this.setActiveTab(workspaceId, tabIdx);
        }

        if ((activeTabIdx === null) || (activeTabIdx >= tabs.length)) {
            this.setActiveTab(workspaceId, 0);
        }
    }

    _loadDefault() {
        this._data = {
            activeWorkspaceId: null,
        };
        this._workspaces = {};
        this._ensureWorkspace();
    }

    _load() {
        if (this._auth.isAuthenticated()) {
            var items = [];

            this._api.list(data => {
                items = data;

                items.forEach(item => {
                    if (item.key == 'general') {
                        this._data = JSON.parse(item.data);
                    } else {
                        this._workspaces[item.key] = JSON.parse(item.data);
                    }
                });

                if (!this.isReady()) {
                    items.forEach(item => {
                        this._api.delete(item.key);
                    });
                    this._loadDefault();
                }
            });
        } else {
            this._loadDefault();
        }
    }

    _changedData() {
        if (this._auth.isAuthenticated()) {
            var data = {
                auth: this._auth.toObject(),
                type: 'general',
                data: this._data,
            };
            this._worker.postMessage(data);
        }
    }

    _changedWorkspace(workspaceId, action) {
        if (action === undefined) {
            action = 'update';
        }
        if (this._auth.isAuthenticated()) {
            var data = {
                auth: this._auth.toObject(),
                type: 'workspace',
                data: {
                    action: action,
                    workspaceId: workspaceId,
                    workspace: (action != 'remove') ? this._workspaces[workspaceId] : null,
                },
            };
            this._worker.postMessage(data);
        }
    }
}
