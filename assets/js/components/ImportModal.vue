<template>
  <modal ref="refModal" esc-hide>
    <h3>Import</h3>
    <textarea class="form-control resize-none"
              rows="20"
              v-model="content"></textarea>
    <button class="btn btn-primary mt-3" @click="importClick">Import</button>
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
            show() {
                this.$refs.refModal.show();
            },

            hide() {
                this.$refs.refModal.hide();
            },

            importClick() {
                var data = JSON.parse(this.content);

                var promises = data.map(item => new Promise((resolve, reject) => {
                    this.$api.save(item.key, item.data, "", resolve, reject);
                }));

                Promise.all(promises).then(() => {
                    window.location.reload();
                });
            },
        },
    }
</script>
