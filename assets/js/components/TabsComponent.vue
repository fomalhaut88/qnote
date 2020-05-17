<template>
  <div class="d-flex flex-row flex-wrap pt-1">
    <div v-for="(tab, tabIdx) in getTabs()" class="btn btn-primary btn-sm m-1"
         :class="{active: isActiveTab(tabIdx)}"
         @click="setActiveTab(tabIdx)"
         @contextmenu.prevent="showTabMenu(tabIdx)">
      &nbsp;
      {{ tab.name }}
      <b-dropdown ref="refTabMenu" variant="none" no-caret toggle-class="p-0" class="tab-dropdown">
        <b-dropdown-item @click.stop="moveLeftTab(tabIdx)"><fa-icon class="dropdown-icon" icon="arrow-left" /> Move left</b-dropdown-item>
        <b-dropdown-item @click.stop="moveRightTab(tabIdx)"><fa-icon class="dropdown-icon" icon="arrow-right" /> Move right</b-dropdown-item>
        <b-dropdown-item @click.stop="showRenameModal(tabIdx)"><fa-icon class="dropdown-icon" icon="file-text-o" /> Rename</b-dropdown-item>
        <b-dropdown-item @click.stop="showRemoveModal(tabIdx)"><fa-icon class="dropdown-icon" icon="trash" /> Remove</b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="btn btn-primary btn-sm m-1" @click="addTab()"><fa-icon icon="plus" /></div>

    <modal ref="refRenameModal" class="text-center" esc-hide @click.stop="">
      <h3>Rename tab</h3>
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Tab title" v-model="newTabName">
        <div class="input-group-append">
          <button class="btn btn-primary" type="button" @click="renameTab()" :disabled="!newTabName">Rename</button>
        </div>
      </div>
    </modal>

    <confirm-dialog ref="refRemoveModal"
                    title="Remove tab"
                    text="Do you really want to remove the tab?"
                    :callback="removeTab" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        workspaceId: this.$state.getActiveWorkspaceId(),
        chosenTabIdx: null,
        newTabName: null,
      };
    },
    methods: {
      getTabs() {
        return this.$state.getTabs(this.workspaceId);
      },

      isActiveTab(tabIdx) {
        return this.$state.isActiveTab(this.workspaceId, tabIdx);
      },

      setActiveTab(tabIdx) {
        this.$state.setActiveTab(this.workspaceId, tabIdx);
        this.$root.$emit('tab_changed');
        this.$forceUpdate();
      },

      addTab() {
        var tabIdx = this.$state.addTab(this.workspaceId);
        this.setActiveTab(tabIdx);
        this.$forceUpdate();
      },

      showTabMenu(tabIdx) {
        this.$refs.refTabMenu[tabIdx].show();
      },

      showRenameModal(tabIdx) {
        this.chosenTabIdx = tabIdx;
        this.newTabName = this.$state.getTab(this.workspaceId, tabIdx).name;
        this.$refs.refRenameModal.show();
      },

      showRemoveModal(tabIdx) {
        this.chosenTabIdx = tabIdx;
        this.$refs.refRemoveModal.show();
      },

      moveLeftTab(tabIdx) {
        this.$state.moveLeftTab(this.workspaceId, tabIdx);
        this.$forceUpdate();
      },

      moveRightTab(tabIdx) {
        this.$state.moveRightTab(this.workspaceId, tabIdx);
        this.$forceUpdate();
      },

      renameTab() {
        this.$state.renameTab(this.workspaceId, this.chosenTabIdx, this.newTabName);
        this.$forceUpdate();
        this.$refs.refRenameModal.hide();
      },

      removeTab() {
        this.$state.removeTab(this.workspaceId, this.chosenTabIdx);
        this.$root.$emit('tab_changed');
        this.$forceUpdate();
        this.$refs.refRemoveModal.hide();
      },
    },
    mounted() {
      this.$root.$on('workspace_changed', () => {
        this.workspaceId = this.$state.getActiveWorkspaceId();
        this.$root.$emit('tab_changed');
        this.$forceUpdate();
      });
    },
  }
</script>

<style lang="scss" scoped>
  .active {
    font-weight: bold;
  }

  .tab-dropdown {
    line-height: 18px;
  }

  .dropdown-icon {
    width: 20px;
  }
</style>
