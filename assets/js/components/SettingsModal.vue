<template>
  <div>
    <modal ref="refModal">
      <h3>Settings</h3>

      <hr>

      <h5>Workspaces</h5>

      <div v-for="ws in $state.getWorkspaces()"><a href="#" @click="showEditWorkspaceModal(ws.id)">{{ ws.name }}</a></div>
      <br>
      <div><button class="btn btn-primary" @click="$refs.refAddWorkspaceModal.show()"><fa-icon icon="plus" /> Add workspace</button></div>

      <hr>

      <h5>Change password</h5>

      <input type="text" class="form-control mb-2" placeholder="Username" v-model="changeUsername">
      <input type="password" class="form-control mb-2" placeholder="Current password" v-model="changeCurrentPassword">
      <input type="password" class="form-control mb-2" placeholder="New password" v-model="changeNewPassword">
      <input type="password" class="form-control mb-2" placeholder="Confirm new password" v-model="changeConfirmNewPassword">
      <button type="button" class="btn btn-primary mb-2" @click="changePasswordButton()"
              :disabled="!changeUsername || !changeCurrentPassword || !changeNewPassword || (changeConfirmNewPassword != changeNewPassword) || (changeCurrentPassword == changeNewPassword)">
        Change password
      </button>

      <hr>

      <h5>Delete profile</h5>

      <input type="text" class="form-control mb-2" placeholder="Username" v-model="deleteUsername">
      <input type="password" class="form-control mb-2" placeholder="Current password" v-model="deletePassword">
      <button type="button" class="btn btn-danger mb-2" @click="deleteProfileButton()">Delete profile</button>
    </modal>

    <modal ref="refAddWorkspaceModal" class="text-center" esc-hide @click.stop="">
      <h3>New workspace</h3>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Workspace name" v-model="newWorkspaceName">
      </div>
      <button class="btn btn-primary" type="button" @click="addWorkspace()" :disabled="!newWorkspaceName">Add workspace</button>
    </modal>

    <modal ref="refEditWorkspaceModal" class="text-center" esc-hide @click.stop="">
      <h3>New workspace</h3>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Workspace name" v-model="editWorkspaceName">
      </div>
      <button class="btn btn-primary" type="button" @click="renameWorkspace()" :disabled="!editWorkspaceName">Rename workspace</button>
      <button class="btn btn-danger" type="button" @click="$refs.refRemoveWorkspaceModal.show()">Remove workspace</button>
    </modal>

    <confirm-dialog ref="refRemoveWorkspaceModal"
                    title="Remove workspace"
                    text="Do you want to remove the workspace?"
                    :callback="removeWorkspace" />

    <confirm-dialog ref="refDeleteProfileModal"
                    title="Delete profile"
                    text="Do you really want to delete your profile permanently?"
                    :callback="deleteProfile" />

    <info-dialog ref="refInfoDialog"
                 title="Error"
                 :text="infoText" />
  </div>
</template>

<script>
  import Auth from '../auth';
  import Api from '../api';

  export default {
    data() {
      return {
        newWorkspaceName: "",
        editWorkspaceName: "",
        chosenWorkspaceId: null,
        changeUsername: "",
        changeCurrentPassword: "",
        changeNewPassword: "",
        changeConfirmNewPassword: "",
        deleteUsername: "",
        deletePassword: "",
        infoText: "",
      };
    },
    methods: {
      show() {
        this.$refs.refModal.show();
      },

      hide() {
        this.$refs.refModal.hide();
      },

      showEditWorkspaceModal(workspaceId) {
        this.chosenWorkspaceId = workspaceId;
        this.editWorkspaceName = this.$state.getWorkspace(workspaceId).name;
        this.$refs.refEditWorkspaceModal.show();
      },

      renameWorkspace() {
        this.$state.renameWorkspace(this.chosenWorkspaceId, this.editWorkspaceName);
        this.$root.$emit('workspace_changed');
        this.$forceUpdate();
        this.$refs.refEditWorkspaceModal.hide();
      },

      addWorkspace() {
        this.$state.addWorkspace(this.newWorkspaceName);
        this.$root.$emit('workspace_changed');
        this.$forceUpdate();
        this.$refs.refAddWorkspaceModal.hide();
      },

      removeWorkspace() {
        this.$state.removeWorkspace(this.chosenWorkspaceId);
        this.$root.$emit('workspace_changed');
        this.$forceUpdate();
        this.$refs.refRemoveWorkspaceModal.hide();
        this.$refs.refEditWorkspaceModal.hide();
      },

      changePasswordButton() {
        // Check new password for correctness
        var checkResult = this.$auth.checkPassword(this.changeNewPassword);

        if (checkResult.success) {
          // Defining auth based on entered current username and password
          var oldAuth = new Auth();
          oldAuth.init(this.$auth.wasm);
          oldAuth.login(this.changeUsername, this.changeCurrentPassword);

          // Check keys' match
          if (oldAuth.publicKey == this.$auth.publicKey) {
            // Defining auth based on new password
            var newAuth = new Auth();
            newAuth.init(this.$auth.wasm);
            newAuth.login(this.changeUsername, this.changeNewPassword);

            // Defining api based on new password
            var newApi = new Api();
            newApi.init(newAuth);

            // Request for items for new password:
            // empty list expected, otherwise you guessed somebody's password :)
            newApi.list(items => {
              if (items.length == 0) {
                // Copying data into a new profile
                var workspaces = this.$state.getWorkspaces();

                var promises = [];

                // Promises to copy workspaces
                Object.keys(workspaces).forEach(workspaceId => {
                  promises.push(new Promise((resolve, reject) => {
                    newApi.save(workspaceId, JSON.stringify(workspaces[workspaceId]), resolve);
                  }));
                });

                // A promise to copy general information
                promises.push(new Promise((resolve, reject) => {
                  newApi.save('general', JSON.stringify(this.$state.getGeneralData()), resolve);
                }));

                Promise.all(promises).then(() => {
                  // Deleting records from the old profile
                  var promises = [];

                  // Promises to remove workspaces
                  Object.keys(workspaces).forEach(workspaceId => {
                    promises.push(new Promise((resolve, reject) => {
                      this.$api.delete(workspaceId, resolve);
                    }));
                  });

                  // A promise to remove general information
                  promises.push(new Promise((resolve, reject) => {
                    this.$api.delete('general', resolve);
                  }));

                  Promise.all(promises).then(() => {
                    // Saving new auth locally
                    this.$auth.logout();
                    newAuth.save();
                    window.location.reload();
                  });
                });
              }
            });

          } else {
            // Info dialog with error
            this.infoText = "Wrong username or password.";
            this.$refs.refInfoDialog.show();
          }
        }
        else {
          // Info dialog with error
          this.infoText = checkResult.error;
          this.$refs.refInfoDialog.show();
        }
      },

      deleteProfileButton() {
        // Defining auth based on entered username and password
        var auth = new Auth();
        auth.init(this.$auth.wasm);
        auth.login(this.deleteUsername, this.deletePassword);

        // Check keys' match
        if (auth.publicKey == this.$auth.publicKey) {
          // Delete profile confirmation
          this.$refs.refDeleteProfileModal.show();
        } else {
          // Info dialog with error
          this.infoText = "Wrong username or password.";
          this.$refs.refInfoDialog.show();
        }
      },

      deleteProfile() {
        var workspaces = this.$state.getWorkspaces();

        var promises = [];

        // Promises to remove workspaces
        Object.keys(workspaces).forEach(workspaceId => {
          promises.push(new Promise((resolve, reject) => {
            this.$api.delete(workspaceId, resolve);
          }));
        });

        // A promise to remove general information
        promises.push(new Promise((resolve, reject) => {
          this.$api.delete('general', resolve);
        }));

        Promise.all(promises).then(() => {
          this.$auth.logout();
          window.location.reload();
        });
      },
    },
  }
</script>
