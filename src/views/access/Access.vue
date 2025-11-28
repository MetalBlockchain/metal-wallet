<template>
  <div class="access_view">
    <div class="w-container">
      <div class="w-row w-row--justify-center">
        <div class="w-col w-col--lg-10 w-col--md-12">
          <router-view v-slot="{ Component }" class="access_card">
            <transition mode="out-in" name="fade">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useHead } from "@unhead/vue";
import { defineComponent } from "vue";

export const Access = defineComponent({
  setup() {
    const description =
      "Access your stored crypto assets in a simple fashion, yet highly secure, and non-custodial fashion. Your Avalanche wallet is a few clicks away!";
    useHead({
      title: () => "Access Stored Crypto Assets",
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
          content: "Access Stored Crypto Assets | Avalanche Wallet",
        },
      ],
    });
  },
});
export default Access;
</script>
<style scoped lang="scss">
.access_view {
  display: flex;
  justify-content: center;
  align-items: center;
}

.access_card {
  text-align: center;
}
</style>
