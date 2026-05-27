<template>
  <div class="access_card">
    <div class="content">
      <Identicon :value="account.baseAddresses.join('')"></Identicon>
      <h1>{{ account.name }}</h1>
      <form @submit.prevent="access">
        <input
          v-model="password"
          class="single_line_input hover_border pass"
          placeholder="Password"
          type="password"
        />
        <p class="err">{{ error }}</p>
        <v-btn
          class="ava_button button_secondary"
          depressed
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="access"
        >
          Access Wallet
        </v-btn>
        <small>{{ $t("keys.account_slow_warning") }}</small>
        <br />
        <br />
      </form>
      <router-link class="link" to="/access">Cancel</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Identicon from "@/components/misc/Identicon.vue";

export const Account = defineComponent({
  components: { Identicon },
  data() {
    return {
      password: "",
      isLoading: false,
      error: "",
    };
  },
  computed: {
    index() {
      return this.$route.params.index;
    },
    accounts() {
      return this.$store.state.Accounts.accounts;
    },
    account() {
      if (this.index && !Array.isArray(this.index)) {
        return this.accounts[this.index];
      }
      return [];
    },
    canSubmit(): boolean {
      if (!this.password) {
        return false;
      }
      return true;
    },
  },
  created() {
    if (!this.account) {
      this.$router.replace("/access");
      return;
    }
  },
  methods: {
    async access() {
      const { account } = this;
      if (!this.canSubmit || this.isLoading) return;
      if (account == null) return;

      this.error = "";
      this.isLoading = true;

      setTimeout(() => {
        this.$store
          .dispatch("Accounts/accessAccount", {
            index: this.index,
            pass: this.password,
          })
          .then(() => {
            this.isLoading = false;
          })
          .catch((error) => {
            if (error === "INVALID_PASS") {
              this.error = this.$t("access.password_error").toString();
            } else if (error === "INVALID_VERSION") {
              this.error = this.$t("access.keystore_error").toString();
            } else {
              this.error = error.message;
            }
            this.isLoading = false;
          });
      }, 200);
    },
    onsuccess() {
      this.isLoading = false;
      this.password = "";
    },
    onerror(e: any) {
      this.error = e;
      this.password = "";
      this.isLoading = false;
    },
  },
});
export default Account;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";
.pass {
  text-align: center;
  background-color: var(--bg-light) !important;
}
.ava_button {
  width: 100%;
  margin-bottom: 22px;
}
.access_card {
  /*max-width: 80vw;*/
  //background-color: var(--bg-light);
  //padding: main.$container-padding;
  width: 100%;
  /*max-width: 240px;*/
  /*max-width: 1000px;*/
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}
.content {
  width: 340px;
  max-width: 100%;
  margin: 0px auto;
}
h1 {
  font-size: vars.$m-size;
  font-weight: 400;
}

form {
  margin: 14px 0;
}
.file_in {
  margin: 30px auto 10px;
  font-size: 13px;
  border: none !important;
  background-color: var(--bg-light) !important;
  /*min-width: 200px*/
}
a {
  color: vars.$primary-color-light !important;
  text-decoration: underline !important;
  margin: 10px 0 20px;
}
.link {
  color: var(--secondary-color);
}
.remember {
  margin: 12px 0;
}
.err {
  font-size: 13px;
  color: var(--error);
  margin: 14px 0px !important;
}
@include mixins.mobile-device {
  h1 {
    font-size: vars.$m-size-mobile;
  }
  .but_primary {
    width: 100%;
  }
}
</style>
