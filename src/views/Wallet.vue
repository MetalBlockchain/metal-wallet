<template>
  <div ref="wallet_view" class="wallet_view">
    <UpdateKeystoreModal v-if="isManageWarning"></UpdateKeystoreModal>
    <transition mode="out-in" name="fade">
      <sidebar class="panel sidenav"></sidebar>
    </transition>
    <div class="wallet_main">
      <top-info class="wallet_top"></top-info>
      <router-view id="wallet_router" :key="$route.path" v-slot="{ Component }">
        <transition mode="out-in" name="page_fade">
          <keep-alive
            :exclude="[
              'cross_chain',
              'activity',
              'advanced',
              'earn',
              'manage',
              'studio',
            ]"
          >
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
    <transition mode="out-in" name="fade">
      <main-panel class="panel"></main-panel>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import UpdateKeystoreModal from "@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue";
import MainPanel from "@/components/SidePanels/MainPanel.vue";
import Sidebar from "@/components/wallet/Sidebar.vue";
import TopInfo from "@/components/wallet/TopInfo.vue";
import { usePosthog } from "@/plugins/posthog";
import { useRootStore } from "@/stores/pinia/root";

const TIMEOUT_DURATION = 60 * 15; // in seconds
const TIMEOUT_DUR_MS = TIMEOUT_DURATION * 1000;

const rootStore = useRootStore();
const posthog = usePosthog();
const router = useRouter();

const intervalId = ref<ReturnType<typeof setTimeout> | null>(null);
const logoutTimestamp = ref<number>(0);
const isLogOut = ref(false);
const wallet_view = useTemplateRef<HTMLDivElement>("wallet_view");

const isManageWarning = computed(() => {
  if (rootStore.warnUpdateKeyfile) {
    return true;
  }
  return false;
});

const hasVolatileWallets = computed(() => rootStore.volatileWallets.length > 0);

function resetTimer() {
  logoutTimestamp.value = Date.now() + TIMEOUT_DUR_MS;
}

function checkLogout() {
  const now = Date.now();

  // Logout if current time is passed the logout timestamp
  if (now >= logoutTimestamp.value && !isLogOut.value) {
    isLogOut.value = true;
    rootStore.timeoutLogout();
  }
}

function unload(event: BeforeUnloadEvent) {
  // user has no wallet saved
  if (
    !localStorage.getItem("w") &&
    hasVolatileWallets.value &&
    isLogOut.value
  ) {
    event.preventDefault();
    isLogOut.value = false;
    router.push("/wallet/keys");
    resetTimer();
  }
}

onMounted(() => {
  posthog?.capture("UserLoggedIn");

  const view = wallet_view.value;
  if (view) {
    view.addEventListener("mousemove", resetTimer);
    view.addEventListener("mousedown", resetTimer);

    window.addEventListener("beforeunload", unload);
  }
});

onBeforeUnmount(() => {
  const view = wallet_view.value;
  if (view) {
    // Remove Event Listeners
    view.removeEventListener("mousemove", resetTimer);
    view.removeEventListener("mousedown", resetTimer);
    window.removeEventListener("beforeunload", unload);
  }
});

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

resetTimer();

intervalId.value = setInterval(() => {
  checkLogout();
}, 1000);
</script>

<style lang="scss" scoped>
@use "@/styles/abstracts/mixins";

.wallet_view {
  padding-bottom: 0;
  display: grid;
  grid-template-columns: 256px 1fr 300px;
  column-gap: 15px;
  height: 100%;
}

.sidenav {
  background-color: var(--sidebar);
}

.panel {
  overflow: auto;
  height: 100%;
}

.wallet_main {
  height: 100%;
  display: grid;
  grid-template-rows: max-content 1fr;
  grid-gap: 15px;
  padding-top: 8px;
}

#wallet_router {
  padding: 22px 20px;
  background-color: var(--bg-wallet-light);
  border-radius: 4px;
}

.page_fade-enter-active,
.page_fade-leave-active {
  transition: all 0.2s;
}
.page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

@include mixins.mobile-device {
  .wallet_view {
    display: block;
    column-gap: 9px;
  }
  .wallet_main {
    grid-gap: 9px;
    padding-top: 0;
  }

  .wallet_sidebar {
    display: none;
  }
}

@include mixins.medium-device {
  .wallet_view {
    grid-template-columns: 180px 1fr 240px !important;
    column-gap: 9px;
  }

  .wallet_main {
    grid-gap: 9px;
  }

  #wallet_router {
    padding: 12px 18px;
  }
}
</style>
