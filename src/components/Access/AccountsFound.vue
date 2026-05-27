<template>
  <div v-if="accounts.length > 0">
    <div
      v-for="(acct, i) in accounts"
      :key="i"
      class="flex_container menu_option"
      @click="selectAccount(i)"
    >
      <Identicon
        :diameter="40"
        :value="acct.baseAddresses.join('')"
      ></Identicon>
      <p>{{ acct.name }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { iUserAccountEncrypted } from "@/stores/types";
import { defineComponent } from "vue";
import Identicon from "@/components/misc/Identicon.vue";

export const AccountsFound = defineComponent({
  components: {
    Identicon,
  },
  data() {
    const accounts: iUserAccountEncrypted[] = [];

    return {
      accounts,
    };
  },
  created() {
    this.refreshAccounts();
  },
  methods: {
    refreshAccounts() {
      const accountsRaw = localStorage.getItem("accounts") || "{}";
      this.accounts = JSON.parse(accountsRaw) || [];
    },
    selectAccount(index: number) {
      this.$router.push(`/access/account/${index}`);
    },
  },
});
export default AccountsFound;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
@use "@/styles/abstracts/vars";
@use "./menu";

.account {
  background-color: var(--bg-light);
  padding: 12px;
  margin: 2px 0;
  cursor: pointer;
  p {
    flex-grow: 1;
    text-align: left;
    padding: 0 1em;
  }

  &:hover {
    opacity: 0.6;
  }
}

.access_card {
  background-color: var(--bg-light) !important;
  padding: vars.$container-padding;
}
h3 {
  margin-top: 1rem;
}

.options {
  margin: 30px auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
}

//.option {
//    position: relative;
//    transition-duration: 0.1s;
//    transition-timing-function: ease-in;
//    border-radius: 6px;
//    font-family: 'DM Sans', sans-serif;
//    font-weight: 700 !important;
//    text-transform: uppercase;
//    padding: 8px 18px;
//    font-size: vars.$s-size;
//    display: flex;
//    align-items: center;
//    justify-content: center;
//
//    &:hover {
//        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
//    }
//}

@include mixins.mobile-device {
  .card {
    padding: vars.$container-padding-mobile;
  }

  .options {
    display: block;
    grid-template-columns: none;
  }

  //.option {
  //    width: 100%;
  //    margin: 12px 0px;
  //    display: block;
  //}
}
</style>
