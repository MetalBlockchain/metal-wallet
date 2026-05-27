<template>
  <transition name="fade">
    <div v-if="isActive" class="modal_main">
      <div class="modal_bg" :icy="icy" @click="bgclick"></div>
      <div class="modal_body">
        <div class="modal_topbar">
          <h4 class="modal_title">{{ title }}</h4>
          <button v-if="canClose" class="modalClose" @click="close">
            <fa icon="times"></fa>
          </button>
        </div>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export const Modal = defineComponent({
  props: {
    title: { default: "Modal Title", type: String },
    canClose: { default: true, type: Boolean },
    icy: { default: false, type: Boolean },
  },
  emits: ["before-close"],
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    open() {
      this.isActive = true;
    },
    bgclick() {
      if (this.canClose) {
        this.close();
      }
    },
    close() {
      this.$emit("before-close");
      this.isActive = false;
    },
  },
});
export default Modal;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.modal_topbar {
  background-color: var(--bg);
  border-bottom: var(--bg);
  color: var(--primary-color);
  border-bottom: 2px solid var(--bg-wallet);
  position: relative;
  padding: 10px 22px;
  display: flex;
}

.modal_title {
  font-size: 22px;
  text-align: left;
  flex-grow: 1;
  margin: 0;
  font-weight: 400;
}

.modalClose {
  font-size: 22px;
  font-weight: lighter;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}

.modal_main {
  z-index: 3;
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  overflow: scroll;
  display: flex;
}

.modal_bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  vertical-align: center;
  align-items: center;

  &[icy] {
    backdrop-filter: blur(4px);
  }
}

.modal_body {
  width: max-content;
  max-width: 90%;
  min-height: 30px;
  background-color: var(--bg);
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
  margin: auto;
  z-index: 2;
  border-radius: 22px;
  overflow: hidden;
}

@include mixins.mobile-device {
  .modal_body {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin: 0;
    padding-bottom: 20px;
    max-width: none;
    border-radius: 0px;
    border-top-right-radius: 30px;
    border-top-left-radius: 30px;
  }
}
</style>
