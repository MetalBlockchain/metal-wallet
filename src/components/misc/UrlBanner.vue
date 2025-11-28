<template>
  <v-banner v-if="showBanner" ref="banner" class="url_banner" sticky>
    <template #default>
      <div>
        <fa icon="exclamation-triangle"></fa>
        Make sure the URL is
        <b>wallet.metalblockchain.org</b>
      </div>
      <button class="dismiss_but" data-cy="dismiss_banner" @click="dismiss">
        <fa icon="times"></fa>
      </button>
    </template>
  </v-banner>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export const UrlBanner = defineComponent({
  emits: ["hide"],
  setup() {
    const showBanner = ref(true);
    return {
      showBanner,
    };
  },
  mounted() {
    if (this.$route.name === "legal") {
      this.dismiss();
    }
  },
  methods: {
    dismiss() {
      this.showBanner = false;
      this.$emit("hide");
    },
  },
});
export default UrlBanner;
</script>
<style scoped lang="scss">
.url_banner {
  &#{&} {
    background-color: #992005;
    color: #fff;
    z-index: 3 !important;
  }

  .dismiss_but {
    margin-right: 8px;
    margin-left: auto;
  }
}
</style>
