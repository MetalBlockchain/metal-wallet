<template>
  <v-app>
    <v-main>
      <UrlBanner @hide="hideBanner"></UrlBanner>
      <Navbar v-show="isNavbar"></Navbar>
      <div ref="main-cols" class="main_cols" :data-wallet-view="!isNavbar">
        <UpgradeToAccountModal></UpgradeToAccountModal>
        <router-view id="router_view" v-slot="{ Component }">
          <transition mode="out-in" name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </v-main>
    <LedgerBlock ref="ledger_block"></LedgerBlock>
    <LedgerUpgrade></LedgerUpgrade>
    <LedgerWalletLoading></LedgerWalletLoading>
    <NetworkLoadingBlock></NetworkLoadingBlock>
    <Notifications></Notifications>
    <AnalyticsCmp></AnalyticsCmp>
    <TestNetBanner></TestNetBanner>
  </v-app>
</template>

<script lang="ts" setup>
import { useHead } from "@unhead/vue";
import { onMounted, useTemplateRef } from "vue";
import { useStore } from "vuex";
import AnalyticsCmp from "@/components/Analytics/Analytics.vue";
import NetworkLoadingBlock from "@/components/misc/NetworkLoadingBlock.vue";
import UrlBanner from "@/components/misc/UrlBanner.vue";

import LedgerBlock from "@/components/modals/LedgerBlock.vue";
import LedgerUpgrade from "@/components/modals/LedgerUpgrade.vue";
import LedgerWalletLoading from "@/components/modals/LedgerWalletLoading.vue";
import UpgradeToAccountModal from "@/components/modals/SaveAccount/UpgradeToAccountModal.vue";
import Navbar from "@/components/Navbar.vue";
import Notifications from "@/components/Notifications.vue";

import TestNetBanner from "@/components/TestNetBanner.vue";
import { themeKey } from "@/constants/injection_tokens";
import { manageLocalization } from './composables/manage-localizations';

const mainCols = useTemplateRef("main-cols");

// const i18n = useI18n();
const router = useRouter();
const route = useRoute();
const store = useStore();
const { loadLocalization } = manageLocalization()

// Init language preference
const locale = localStorage.getItem("lang");
if (locale) {
  loadLocalization(locale);
}

provide(themeKey, ref("light"));

const isNavbar = computed(() => {
  if (route.path.includes("/wallet")) {
    return false;
  }
  return true;
});

useHead({
  title: () => "Fastest Performing and Secure DeFi Wallet",
  meta: [
    {
      property: "og:description",
      content:
        "Metal wallet is a simple, highly secure, non-custodial crypto wallet for storing METAL.",
    },
    {
      property: "description",
      content:
        "Metal wallet is a simple, highly secure, non-custodial crypto wallet for storing METAL.",
    },
    {
      property: "og:title",
      content: "Fastest Performing and Secure DeFi Wallet | Metal Wallet",
    },
  ],
});

async function onCreated() {
  await store.dispatch("Network/init");
  store.commit("Accounts/loadAccounts");
  store.dispatch("Assets/initErc20List");
  store.dispatch("Assets/ERC721/init");
  store.dispatch("updateAvaxPrice");
  store.dispatch("loadValidatorMetaData");

  if (
    store.state.Accounts.accounts.length > 0 && // Do not route for legal pages
    route.name !== "legal"
  ) {
    router.push("/access");
  }
}

function hideBanner() {
  mainCols.value?.style.setProperty("--main-cols-offset", "0");
}

onCreated();

onMounted(() => {
  // Reveal app version
  console.log(`App Version: ${__APP_VERSION__}`);
  // Hide loader once vue is initialized
  const loader = document.querySelector<HTMLElement>("#app_loading");
  if (loader) {
    loader.style.display = "none";
  }
});
</script>
