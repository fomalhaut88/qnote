<template>
  <modal ref="refModal" esc-hide>
    <h3>Export</h3>
    <textarea class="form-control resize-none"
              readonly
              rows="20"
              v-model="content"></textarea>
  </modal>
</template>

<script>
    export default {
        data() {
            return {
                content: "",
            };
        },
        methods: {
            load() {
                this.content = "Loading...";
                this.$api.list(data => {
                    this.content = JSON.stringify(data);
                });
            },

            show() {
                this.$refs.refModal.show();
                this.load();
            },

            hide() {
                this.$refs.refModal.hide();
            },
        },
    }
</script>
