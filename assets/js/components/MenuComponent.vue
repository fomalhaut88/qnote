<template>
  <div class="pt-1">
    <b-dropdown variant="none" right no-caret toggle-class="p-0" class="m-0">
      <template v-slot:button-content>
        <fa-icon icon="ellipsis-v" class="btn btn-primary menu-btn" />
      </template>

      <b-dropdown-item v-for="ws in getWorkspaces()" :key="ws.id"
                       @click="setActiveWorkspace(ws.id)">
        <fa-icon class="menu-dropdown-icon"
                 :icon="$state.isActiveWorkspace(ws.id) ? 'check' : 'empty'" />
        {{ ws.name }}
      </b-dropdown-item>

      <b-dropdown-divider></b-dropdown-divider>

      <b-dropdown-item @click="$refs.refAboutModal.show()">
        <fa-icon class="menu-dropdown-icon" icon="info" /> About Qnote
      </b-dropdown-item>
      <b-dropdown-item @click="$refs.refExportModal.show()">
        <fa-icon class="menu-dropdown-icon" icon="download" /> Export
      </b-dropdown-item>
      <b-dropdown-item @click="$refs.refImportModal.show()">
        <fa-icon class="menu-dropdown-icon" icon="upload" /> Import
      </b-dropdown-item>
      <b-dropdown-item @click="$refs.refSettingsModal.show()">
        <fa-icon class="menu-dropdown-icon" icon="cog" /> Settings
      </b-dropdown-item>
      <b-dropdown-item @click="$refs.refLogoutDialog.show()">
        <fa-icon class="menu-dropdown-icon" icon="sign-out" /> Log out
      </b-dropdown-item>
    </b-dropdown>

    <about-modal ref="refAboutModal" />
    <export-modal ref="refExportModal" />
    <import-modal ref="refImportModal" />
    <settings-modal ref="refSettingsModal" />
    <confirm-dialog ref="refLogoutDialog"
                    title="Logout"
                    text="Do you really want to log out?"
                    :callback="logout" />
  </div>
</template>

<script>
  export default {
    methods: {
      getWorkspaces() {
        var workspaces = Object.values(this.$state.getWorkspaces());
        workspaces.sort((ws1, ws2) => (ws1.name > ws2.name) ? 1 : -1);
        return workspaces;
      },

      logout() {
        this.$auth.logout();
        window.location.reload();
      },

      setActiveWorkspace(workspaceId) {
        this.$state.setActiveWorkspace(workspaceId);
        this.$root.$emit('workspace_changed');
        this.$forceUpdate();
      },
    },
    mounted() {
      this.$root.$on('workspace_changed', () => {
        this.$forceUpdate();
      });

      this.$root.$on('show_about', () => {
        this.$refs.refAboutModal.show();
      });
    },
  }
</script>

<style lang="scss" scoped>
  .menu-btn {
    font-size: 20px;
    line-height: 32px;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 16px;
  }

  .menu-dropdown-icon {
    width: 20px;
  }
</style>
