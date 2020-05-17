<template>
  <modal ref="refModal">
    <h3>About Qnote</h3>
    <p>Qnote.</p>
    <button class="btn btn-primary" @click="hide()">OK</button>
  </modal>
</template>

<script>
  export default {
    methods: {
      show() {
        this.$refs.refModal.show();
      },

      hide() {
        this.$refs.refModal.hide();
      },
    },
  }
</script>
