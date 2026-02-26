<template>
  <div
    class="network_menu"
    :connected="status === 'connected'"
    data-cy="network-switcher"
    @keydown.esc="closeMenu"
  >
    <div class="toggle_but" :testnet="isTestnet" @click="toggleMenu">
      <span
        :style="{
          backgroundColor: connectionColor,
        }"
      ></span>
      <p v-if="activeNetwork">{{ activeNetwork.name }}</p>
      <p v-else>Disconnected</p>
      <!--            <template v-if="status === 'disconnected' || status === 'connecting'">-->
      <!--                <img v-if="$root.theme === 'day'" src="@/assets/network_off.png" />-->
      <!--                <img v-else src="@/assets/network_off_night.svg" />-->
      <!--            </template>-->
      <!--            <template v-else>-->
      <!--                <img v-if="$root.theme === 'day'" src="@/assets/network_on.png" />-->
      <!--                <img v-else src="@/assets/network_off_night.svg" />-->
      <!--            </template>-->
      <!--            <button v-if="status === 'connected'">-->
      <!--                {{ activeNetwork.name }}-->
      <!--            </button>-->
      <!--            <button v-else-if="status === 'connecting'">-->
      <!--                {{ $t('network.status1') }}-->
      <!--            </button>-->
      <!--            <button v-else>{{ $t('network.status2') }}</button>-->
    </div>
    <transition name="fade">
      <div
        v-if="isActive"
        key="bg"
        class="network_dispose_bg"
        @click="closeMenu"
      ></div>
    </transition>
    <transition name="slide_right">
      <div v-if="isActive" key="body" class="network_body">
        <div class="header" data-cy="custom-network-option">
          <template v-if="page === 'list'">
            <h4>{{ $t("network.title") }}</h4>
            <button
              class="button_secondary"
              data-cy="create-custom-option"
              @click="viewCustom"
            >
              {{ $t("network.custom") }}
            </button>
          </template>
          <template v-if="page === 'custom'">
            <h4>{{ $t("network.title2") }}</h4>
            <button class="tab_cancel" @click="viewList">
              {{ $t("network.cancel") }}
            </button>
          </template>
          <template v-if="page === 'edit'">
            <h4>{{ $t("network.title3") }}</h4>
            <button class="tab_cancel" @click="viewList">
              {{ $t("network.cancel") }}
            </button>
          </template>
        </div>

        <transition mode="out-in" name="fade">
          <ListPage v-if="page === 'list'" @edit="onedit"></ListPage>
          <CustomPage
            v-else-if="page === 'custom'"
            @add="addCustomNetwork"
          ></CustomPage>
          <EditPage
            v-else-if="page === 'edit'"
            :net="editNetwork"
            @success="networkUpdated"
          ></EditPage>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import type { AvaNetwork } from "@/js/AvaNetwork";
import type { NetworkStatus } from "@/stores/types/network";
import { defineComponent } from "vue";
import CustomPage from "./CustomPage.vue";
import EditPage from "./EditPage.vue";
import ListPage from "./ListPage.vue";

export const NetworkMenu = defineComponent({
  components: {
    ListPage,
    CustomPage,
    EditPage,
  },
  data(): {
    page: string;
    isActive: boolean;
    editNetwork: AvaNetwork | null;
  } {
    const editNetwork: AvaNetwork | null = null;
    return {
      page: "list",
      isActive: false,
      editNetwork,
    };
  },
  computed: {
    connectionColor(): string {
      switch (this.status) {
        case "connecting": {
          return "#112EBD";
        }
        case "connected": {
          return "#20BF55";
        }
        default: {
          return "#992005";
        }
      }
    },
    status(): NetworkStatus {
      return this.$store.state.Network.status;
    },
    activeNetwork(): null | AvaNetwork {
      return this.$store.state.Network.selectedNetwork;
    },
    networks(): AvaNetwork[] {
      return this.$store.getters("Network/allNetworks");
    },
    isTestnet(): boolean {
      const net = this.activeNetwork;

      if (!net) return false;
      if (net.networkId !== 1) return true;
      return false;
    },
  },
  methods: {
    viewCustom(): void {
      this.page = "custom";
    },
    viewList(): void {
      this.page = "list";
    },
    closeMenu(): void {
      this.page = "list";
      this.isActive = false;
    },
    toggleMenu(): void {
      this.isActive = !this.isActive;
    },
    addCustomNetwork(data: AvaNetwork): void {
      this.$store.dispatch("Network/addCustomNetwork", data);
      this.page = "list";
    },
    networkUpdated() {
      this.page = "list";
      this.$store.dispatch("Network/save");
    },
    onedit(network: AvaNetwork): void {
      this.editNetwork = network;
      this.page = "edit";
    },
  },
});
export default NetworkMenu;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.network_menu {
  position: relative;
}

.toggle_but {
  //border: 2px solid var(--bg-light);
  padding: 2px 10px;
  //font-size: 13px;
  display: flex;
  border-radius: 6px;
  position: relative;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-light);
  }

  $dotW: 8px;
  span {
    width: $dotW;
    height: $dotW;
    border-radius: $dotW;
    margin-right: 4px;
  }

  p {
    user-select: none;
  }

  button {
    outline: none !important;
  }

  img {
    max-height: 24px;
    object-fit: contain;
    margin-right: 5px;
  }

  &[testnet]:after {
    position: absolute;
    content: "TEST";
    background-color: var(--secondary-color);
    color: #fff;
    font-size: 9px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 12px;
    right: -20px;
    top: -8px;
  }
}

.tab_cancel {
  color: var(--primary-color);
}

.network_dispose_bg {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
}

.network_body {
  position: fixed;
  z-index: 3;
  top: 0;
  right: 0;
  height: 100%;
  border: 1px solid var(--bg-light);
  border-radius: 4px;
  width: 340px;
  background-color: var(--bg);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
}

.header {
  border-bottom: 1px solid var(--bg-light);
  padding: 10px 15px;
  display: flex;
  h4 {
    flex-grow: 1;
  }

  button {
    font-size: 12px;
    padding: 3px 14px;
    border-radius: 4px;
  }
}

.network_menu[connected] {
  .toggle_but {
    color: var(--primary-color);
  }
}

@media only screen and (max-width: vars.$mobile_width) {
  .network_body {
    position: fixed;
    width: 100vw;
    z-index: 2;
    right: 0 !important;
    left: 0 !important;
  }
}

@include mixins.medium-device {
  .toggle_but {
    min-width: auto;
  }
}
</style>
