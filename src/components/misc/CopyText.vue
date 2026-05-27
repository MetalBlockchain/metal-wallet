<template>
  <div class="copyBut" @click="copy">
    <img v-if="isDay" src="/img/copy_icon.svg" />
    <img v-else src="/img/copy_night.svg" />
    <p class="text">
      <slot></slot>
    </p>
    <input ref="copytext" :value="value" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useOwnTheme } from "@/composables/use-own-theme";

export const CopyText = defineComponent({
  props: {
    value: String,
  },
  setup() {
    const { isDay } = useOwnTheme();
    const store = useStore();
    const copytext = useTemplateRef<HTMLInputElement>("copytext");

    const copy = () => {
      if (copytext.value) {
        copytext.value.select();
        copytext.value.setSelectionRange(0, 99_999);

        document.execCommand("copy");
        store.dispatch("Notifications/add", {
          title: " Copied",
          message: "Copied to clipboard.",
        });
      }
    };

    return {
      isDay,
      copytext,
      copy,
    };
  },
});
export default CopyText;
</script>
<style scoped lang="scss">
.copyBut {
  display: flex;
  width: max-content;
  align-items: center;
  cursor: pointer;

  input {
    width: 1px;
    position: absolute;
    opacity: 0;
  }
}

.text {
  user-select: none;
  pointer-events: none;
  margin-left: 12px !important;
}

img {
  max-height: 18px;
  object-fit: contain;
}
input {
  pointer-events: none;
  user-select: none;
  width: 100% !important;
}
button {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
}
</style>
