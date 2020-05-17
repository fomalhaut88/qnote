<template>
  <div class="area">
    <textarea ref="refArea" v-model="content" @input="saveContent()"></textarea>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        content: "",
      };
    },
    methods: {
      updateContent() {
        var workspaceId = this.$state.getActiveWorkspaceId();
        var tabIdx = this.$state.getActiveTabIdx(workspaceId);
        this.content = this.$state.getTab(workspaceId, tabIdx).content;
        this.$refs.refArea.focus();
      },

      saveContent() {
        var workspaceId = this.$state.getActiveWorkspaceId();
        var tabIdx = this.$state.getActiveTabIdx(workspaceId);
        this.$state.updateTabContent(workspaceId, tabIdx, this.content);
      },
    },
    mounted() {
      this.$root.$on('tab_changed', () => {
        this.updateContent();
      });
      this.updateContent();
    },
  }
</script>

<style lang="scss">
  .area {
    padding: 0px;

    textarea {
      width: 100%;
      height: 100%;
      padding: 1px 3px;
      font-size: 16px;
      line-height: 18px;
      resize: none;

      &:focus {
        outline: none;
      }
    }
  }
</style>
