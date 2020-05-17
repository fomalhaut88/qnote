<template>
  <div v-show="isShown">
    <div class="whole">
      <div class="content">
        <span class="close" @click="hide()">&times;</span>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      escHide: Boolean,
    },
    data() {
      return {
        isShown: false,
      }
    },
    methods: {
      show() {
        this.isShown = true;
      },

      hide() {
        this.isShown = false;
      },

      toggle() {
        this.isShown = !this.isShown;
      },
    },
    mounted() {
      if (this.escHide) {
        document.body.addEventListener('keyup', e => {
          if (e.keyCode === 27) {  // Esc
            this.hide();
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .whole {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.375);
  }

  .content {
    position: relative;
    background-color: white;
    margin: 0 auto;
    transform: translateY(minmax(0, calc(50vh - 50%)));
    padding: 18px;
    max-width: 400px;
  }

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 24px;
    cursor: pointer;
    color: #888;
    &:hover {
      opacity: 0.75;
    }
  }
</style>
