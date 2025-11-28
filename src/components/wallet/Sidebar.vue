<template>
  <div class="wallet_sidebar">
    <div class="stick">
      <div class="brand">
        <img v-if="isDay" src="@/assets/wallet_logo.svg" />
        <img v-else src="@/assets/wallet_logo_dark.svg" />
      </div>
      <div class="links">
        <router-link
          class="wallet_link"
          :title="$t('wallet.sidebar.portfolio')"
          to="/wallet"
        >
          <img v-if="isDay" src="@/assets/sidebar/portfolio_nav.svg" />
          <img v-else src="@/assets/sidebar/portfolio_nav_night.svg" />
          {{ $t("wallet.sidebar.portfolio") }}
        </router-link>
        <router-link
          class="wallet_link"
          data-cy="wallet_transfer"
          :title="$t('wallet.sidebar.send')"
          to="/wallet/transfer"
        >
          <img v-if="isDay" src="@/assets/sidebar/transfer_nav.svg" />
          <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
          {{ $t("wallet.sidebar.send") }}
        </router-link>
        <router-link
          class="wallet_export wallet_link"
          data-cy="wallet_export"
          :title="$t('wallet.sidebar.export')"
          to="/wallet/cross_chain"
        >
          <img v-if="isDay" src="@/assets/sidebar/cross_nav.svg" />
          <img v-else src="@/assets/sidebar/cross_nav_night.svg" />
          {{ $t("wallet.sidebar.export") }}
        </router-link>
        <router-link
          class="wallet_link"
          data-cy="wallet_earn"
          :title="$t('wallet.sidebar.earn')"
          to="/wallet/earn"
        >
          <img v-if="isDay" src="@/assets/sidebar/earn_nav.svg" />
          <img v-else src="@/assets/sidebar/earn_nav_night.svg" />
          {{ $t("wallet.sidebar.earn") }}
        </router-link>
        <router-link
          class="wallet_link"
          data-cy="wallet_activity"
          :title="$t('wallet.sidebar.activity')"
          to="/wallet/activity"
        >
          <img v-if="isDay" src="@/assets/sidebar/activity_nav.svg" />
          <img v-else src="@/assets/sidebar/activity_nav_night.svg" />
          {{ $t("wallet.sidebar.activity") }}
        </router-link>
        <router-link
          class="wallet_link"
          data-cy="wallet_manage"
          :title="$t('wallet.sidebar.manage')"
          to="/wallet/keys"
        >
          <img v-if="isDay" src="@/assets/sidebar/manage_nav.svg" />
          <img v-else src="@/assets/sidebar/manage_nav_night.svg" />
          {{ $t("wallet.sidebar.manage") }}
        </router-link>
        <router-link
          class="wallet_link"
          data-cy="wallet_advanced"
          :title="$t('wallet.sidebar.advanced')"
          to="/wallet/advanced"
        >
          <img v-if="isDay" src="@/assets/sidebar/advanced_nav.svg" />
          <img v-else src="@/assets/sidebar/advanced_nav_night.svg" />
          {{ $t("wallet.sidebar.advanced") }}
        </router-link>
      </div>
      <div class="bottom">
        <AccountMenu class="wallet_link"></AccountMenu>
        <LanguageSelect></LanguageSelect>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import LanguageSelect from "@/components/misc/LanguageSelect/LanguageSelect.vue";
import AccountMenu from "@/components/wallet/sidebar/AccountMenu.vue";
import { useOwnTheme } from "@/composables/use-own-theme";
export const Sidebar = defineComponent({
  components: {
    AccountMenu,
    LanguageSelect,
  },
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
});
export default Sidebar;
</script>
<style lang="scss" scoped>
@use "@/styles/abstracts/mixins";

.wallet_sidebar {
  .stick {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .alert_icon {
    color: #f00;
    flex-grow: 1;
    justify-content: flex-end;
  }

  .brand {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 80%;
      object-fit: contain;
    }
  }

  .links {
    padding: 0 !important;
    margin-left: 16px;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    font-weight: 500;
    font-size: 14px;

    a {
      opacity: 0.6;
      color: var(--primary-color-light);
      text-decoration: none;

      img {
        opacity: 0.5;
      }
    }

    .wallet_link {
      padding: 14px 24px;
      white-space: nowrap;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;

      * {
        vertical-align: middle;
      }
    }

    a.router-link-exact-active {
      color: var(--tertiary-color) !important;
      opacity: 1;
      background-color: var(--sidebar-item);
      border-radius: 6px;
      font-weight: 700;

      img {
        opacity: 1;
      }
    }

    img {
      width: 20px;
      margin-right: 10px;
      object-fit: contain;
    }
  }
}
.wallet_export {
  span {
    display: block;
    margin-right: 15px;
    width: 20px;
  }
}
.bottom {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 30px;

  > * {
    padding: 0px 24px;
    margin-top: 4px;
  }
}

@include mixins.medium-device {
  .brand {
    height: 90px;
  }
  .links {
    font-size: 12px;
  }
}
</style>
