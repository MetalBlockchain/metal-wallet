<template>
  <div id="nav">
    <ConfirmLogout ref="logout"></ConfirmLogout>
    <router-link class="logo" to="/">
      <img v-if="isDay" src="@/assets/wallet_logo.svg" />
      <img v-else src="@/assets/wallet_logo_dark.svg" />
    </router-link>
    <v-spacer></v-spacer>

    <div class="buts_right">
      <DayNightToggle class="action_but"></DayNightToggle>
      <template v-if="isAuth">
        <button @click="logout">{{ $t("logout.button") }}</button>
      </template>
      <template v-else>
        <router-link class="action_but" data-cy="access" to="/access">
          {{ $t("nav.access") }}
        </router-link>
        <router-link class="action_but" data-cy="create" to="/create">
          {{ $t("nav.create") }}
        </router-link>
      </template>
      <NetworkMenu></NetworkMenu>
      <LanguageSelect class="lang_web"></LanguageSelect>
    </div>

    <div class="mobile_right">
      <v-btn class="mobile_drawer" icon @click="isDrawer = !isDrawer">
        <fa icon="bars"></fa>
      </v-btn>
    </div>

    <!--   MOBILE MENU     -->
    <v-navigation-drawer
      ref="drawer"
      v-model="isDrawer"
      class="mobile_menu"
      :disable-resize-watcher="true"
      fixed
      :scrim="false"
      style="z-index: 999"
    >
      <v-list dense nav>
        <div
          style="
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
          "
        >
          <img v-if="isDay" src="@/assets/wallet_logo.svg" />
          <img v-else src="@/assets/wallet_logo_dark.svg" />
          <DayNightToggle class="action_but"></DayNightToggle>
        </div>
        <template v-if="isAuth">
          <router-link to="/wallet">{{
            $t("wallet.sidebar.portfolio")
          }}</router-link>
          <router-link to="/wallet/transfer">{{
            $t("wallet.sidebar.send")
          }}</router-link>
          <router-link to="/wallet/cross_chain">
            {{ $t("wallet.sidebar.export") }}
          </router-link>
          <router-link to="/wallet/earn">{{
            $t("wallet.sidebar.earn")
          }}</router-link>
          <router-link to="/wallet/activity">Activity</router-link>
          <router-link to="/wallet/keys">{{
            $t("wallet.sidebar.manage")
          }}</router-link>
          <router-link data-cy="wallet_advanced" to="/wallet/advanced">
            {{ $t("wallet.sidebar.advanced") }}
          </router-link>
          <button class="logout" @click="logout">
            {{ $t("logout.button") }}
          </button>
        </template>
        <template v-else>
          <router-link to="/access">{{ $t("nav.access") }}</router-link>
          <router-link to="/create">{{ $t("nav.create") }}</router-link>
        </template>
      </v-list>

      <template #append>
        <div class="mobile_bottom">
          <AccountMenu></AccountMenu>
          <LanguageSelect class="lang_mobile"></LanguageSelect>
        </div>
      </template>
    </v-navigation-drawer>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import DayNightToggle from "@/components/misc/DayNightToggle.vue";
import LanguageSelect from "@/components/misc/LanguageSelect/LanguageSelect.vue";
import ConfirmLogout from "@/components/modals/ConfirmLogout.vue";
import NetworkMenu from "@/components/NetworkSettings/NetworkMenu.vue";
import AccountMenu from "@/components/wallet/sidebar/AccountMenu.vue";
import { useOwnTheme } from "@/composables/use-own-theme";
import { useRootStore } from "@/stores/pinia/root";

export const Navbar = defineComponent({
  components: {
    AccountMenu,
    NetworkMenu,
    DayNightToggle,
    ConfirmLogout,
    LanguageSelect,
  },
  setup() {
    const { isDay } = useOwnTheme();
    const rootStore = useRootStore();
    const isAuth = computed(() => rootStore.isAuth);

    return {
      isDay,
      isAuth,
    };
  },
  data() {
    return {
      isDrawer: false,
      popupOpen: false,
    };
  },
  methods: {
    logout(): void {
      (
        this.$refs.logout as ComponentPublicInstance<typeof ConfirmLogout>
      ).open();
    },
    togglePopup(): void {
      this.popupOpen = !this.popupOpen;
    },
  },
});

export default Navbar;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

img {
  max-height: 25px;
}

a {
  text-decoration: none;
  font-weight: normal;
  white-space: nowrap;
  margin-right: 15px;
}

button {
  font-weight: normal;
}

.popup-wrapper {
  position: relative;
}

.popup {
  position: absolute;
  top: 18px;
  right: 0;
  padding: 8px;
  padding-bottom: 10px;
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
  min-width: 280px;
  border: 1px solid var(--bg-light);
  background: var(--bg);
  border-radius: 3px;
}

.daynight {
  margin-right: 15px;
}

#nav {
  .logo {
    display: flex;
    align-items: center;
    color: var(--primary-color-light) !important;
    font-size: 11px;
    font-weight: 700;

    &:hover {
      opacity: 0.7;
    }

    img {
      height: 30px;
      max-height: none !important;
      object-fit: contain;
      margin-right: 5px;
    }
  }
}

.buts_right {
  display: flex;
  align-items: center;

  a {
    margin: 0;
  }
}

.action_but {
  color: var(--primary-color) !important;
  padding: 0 12px;
  border-radius: 4px;
}

.mobile_right {
  display: none;
}

.mobile_bottom {
  padding: 4px 8px 30px;
}

.lang_mobile,
.lang_web {
  width: max-content;
  margin: 0;
}

@include mixins.medium-device {
  img {
    max-height: 18px;
  }
  .buts_right {
    button {
      font-size: 11px;
    }
  }
}

@include mixins.mobile-device {
  .lang_web {
    display: none;
  }

  .buts_right {
    display: none;

    .router-link-exact-active {
      background-color: #42b983;
    }
  }

  .mobile_right {
    display: block;
  }

  .mobile_drawer {
    color: var(--primary-color) !important;
  }

  .logout {
    margin-top: 40px;
  }
}
</style>
<style lang="scss">
.mobile_menu {
  overflow: visible !important;
  background-color: var(--bg-light) !important;

  .v-list-item,
  .v-list-item--link {
    color: var(--primary-color-light) !important;
  }

  .v-list-item--active {
    color: var(--primary-color) !important;
  }

  a,
  .logout {
    display: block;
    padding: 8px 8px;
    color: var(--primary-color-light) !important;
  }

  .router-link-exact-active {
    background-color: var(--bg);
    color: var(--primary-color) !important;
  }
}
</style>
