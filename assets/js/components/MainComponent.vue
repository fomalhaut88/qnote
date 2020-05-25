<template>
  <div class="main" v-if="$state.isReady()">
    <div class="header d-flex">
      <div class="mr-auto ml-1">
        <tabs-component />
      </div>
      <div class="ml-auto mr-1 d-flex">
        <refresh-component />
        <menu-component />
      </div>
    </div>
    <div class="area">
      <area-component />
    </div>
    <need-login />
  </div>
</template>

<script>
  export default {
    mounted() {
      var intervalId = setInterval(() => {
        this.$forceUpdate();
        if (this.$state.isReady()) {
          clearInterval(intervalId);
        }
      }, 100);
    },
  }
</script>
