<template>
  <div>
    <v-tooltip bottom>
      <template #activator="{ props }">
        <button v-bind="props">
          <slot></slot>
        </button>
      </template>
      <span>{{ text }}</span>
    </v-tooltip>
  </div>
</template>
<script lang="ts">
export const Tooltip = defineComponent({
  props: {
    text: String,
  },
});
export default Tooltip;
</script>
