<template>
  <div class="pt-2 px-2">
    <fa-icon icon="refresh" class="refresh-icon fa-spin" v-show="isShown" />

    <info-dialog ref="refInfoDialog"
                 title="Error"
                 :text="error" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isShown: false,
        error: "",
      };
    },
    mounted() {
      this.$root.$on('worker_performing', isPerforming => {
        this.isShown = isPerforming;
      });

      this.$root.$on('worker_error', error => {
        this.error = error;
        this.$refs.refInfoDialog.show();
      });
    },
  }
</script>

<style lang="scss" scoped>
  .refresh-icon {
    margin-top: 3px;
    font-size: 20px;
    color: #0060A0;
    opacity: 0.125;
  }
</style>
