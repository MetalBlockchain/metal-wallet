<template>
  <div :active="isActive" class="expandable">
    <div class="toggle" @click="toggle">
      <slot v-if="!isActive" name="triggerOn"></slot>
      <slot v-else name="triggerOff"></slot>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script lang="ts">
export const Expandable = defineComponent({
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    toggle() {
      this.isActive = !this.isActive;
    },
  },
});
export default Expandable;
</script>
<style scoped lang="scss">
.content {
  border-top: 1px solid transparent;
  margin-top: 12px;
  padding-top: 12px;
  max-height: 0vh;
  overflow: hidden;
  transition-duration: 0.2s;
}

.toggle {
  color: var(--primary-color-light);
  font-size: 13px;
  cursor: pointer;
  width: max-content;

  &:hover {
    color: var(--primary-color);
  }
}

.expandable[active] {
  .toggle {
    //color: var(--secondary-color);
  }
  .content {
    max-height: 100vh;
    border-color: var(--bg-light);
  }
}
</style>
