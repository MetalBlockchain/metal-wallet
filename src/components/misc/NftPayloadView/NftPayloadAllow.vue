<template>
  <div class="nft_allow">
    <button v-if="!isSmall" @click="show">
      <fa icon="eye"></fa>
      <br />
      Show
    </button>
    <button v-else @click="show">
      <fa icon="eye"></fa>
    </button>
  </div>
</template>
<script lang="ts">
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { useAssetsStore } from "@/stores/pinia/assets";

export default defineComponent({
  props: {
    nftID: {
      type: String,
    },
    isSmall: { default: false, type: Boolean },
    modelValue: { type: Boolean },
  },
  emits: ["update:modelValue"],
  methods: {
    ...mapActions(useAssetsStore, ["whitelistNFT"]),
    show() {
      this.whitelistNFT(this.nftID);
      this.$emit("update:modelValue", true);
    },
  },
});
</script>
<style scoped lang="scss">
.nft_allow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);

  button {
    font-size: 0.8em;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
