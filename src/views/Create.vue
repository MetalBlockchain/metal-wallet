<template>
  <div class="access_view">
    <create-wallet></create-wallet>
  </div>
</template>
<script lang="ts">
import { useHead } from "@unhead/vue";
import { defineComponent } from "vue";
import CreateWallet from "@/components/CreateWalletWorkflow/CreateWallet.vue";

export const Create = defineComponent({
  components: {
    CreateWallet,
  },
  setup() {
    const description =
      "Here at Metal, we've made storing digital assets easy. Create a Metal wallet today is see what the buzz is all about!";
    useHead({
      title: () => "Create",
      meta: [
        {
          property: "og:description",
          content: description,
        },
        {
          property: "description",
          content: description,
        },
        {
          property: "og:title",
          content: "Create | Metal Wallet",
        },
      ],
    });
  },
});
export default Create;
</script>
<style scoped lang="scss">
.access_view {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  text-align: center;
}

a {
  color: #1d82bb !important;
}
</style>
