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

<script lang="ts">
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import UpdateKeystoreModal from "@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue";
import MainPanel from "@/components/SidePanels/MainPanel.vue";
import Sidebar from "@/components/wallet/Sidebar.vue";
import TopInfo from "@/components/wallet/TopInfo.vue";
import { useRootStore } from "@/stores/pinia/root";

const TIMEOUT_DURATION = 60 * 15; // in seconds
const TIMEOUT_DUR_MS = TIMEOUT_DURATION * 1000;

export default defineComponent({
  components: {
    Sidebar,
    MainPanel,
    TopInfo,
    UpdateKeystoreModal,
  },
  data(): {
    intervalId: ReturnType<typeof setTimeout> | null;
    logoutTimestamp: number;
    isLogOut: boolean;
  } {
    const intervalId: ReturnType<typeof setTimeout> | null = null;

    return {
      intervalId,
      logoutTimestamp: Date.now() + TIMEOUT_DUR_MS,
      isLogOut: false,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      isManageWarning: (store) => {
        if (store.warnUpdateKeyfile) {
          return true;
        }
        return false;
      },
      hasVolatileWallets: (store) => {
        return store.volatileWallets.length > 0;
      },
    }),
  },
  created() {
    this.resetTimer();
    this.intervalId = setInterval(() => {
      this.checkLogout();
    }, 1000);
  },
  mounted() {
    const view = this.$refs.wallet_view as HTMLDivElement;

    this.$posthog.capture("UserLoggedIn");

    view.addEventListener("mousemove", this.resetTimer);
    view.addEventListener("mousedown", this.resetTimer);

    window.addEventListener("beforeunload", this.unload);
  },
  beforeUnmount() {
    const view = this.$refs.wallet_view as HTMLDivElement;
    // Remove Event Listeners
    view.removeEventListener("mousemove", this.resetTimer);
    view.removeEventListener("mousedown", this.resetTimer);
    window.removeEventListener("beforeunload", this.unload);
  },
  unmounted() {
    clearInterval(this.intervalId!);
  },
  methods: {
    ...mapActions(useRootStore, ["timeoutLogout"]),
    resetTimer() {
      this.logoutTimestamp = Date.now() + TIMEOUT_DUR_MS;
    },
    checkLogout() {
      const now = Date.now();

      // Logout if current time is passed the logout timestamp
      if (now >= this.logoutTimestamp && !this.isLogOut) {
        this.isLogOut = true;
        this.timeoutLogout();
      }
    },
    unload(event: BeforeUnloadEvent) {
      // user has no wallet saved
      if (
        !localStorage.getItem("w") &&
        this.hasVolatileWallets &&
        this.isLogOut
      ) {
        event.preventDefault();
        this.isLogOut = false;
        event.returnValue = "";
        this.$router.push("/wallet/keys");
        this.resetTimer();
      }
    },
  },
});
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
