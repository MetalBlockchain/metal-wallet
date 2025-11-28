<template>
  <div class="mnemonic_auth notranslate" translate="no">
    <div class="left">
      <header>
        <h1>{{ $t("access.mnemonic.title") }}</h1>
      </header>
      <p>Your mnemonic phrase is 24 words seperated by an empty space.</p>
      <input
        ref="mnemonic_in"
        autocapitalize="off"
        autocomplete="off"
        placeholder="Type your mnemonic phrase"
        type="password"
      />
      <div class="button_container">
        <p v-if="err" class="err">{{ err }}</p>
        <v-btn
          class="ava_button but_primary button_secondary access"
          depressed
          :loading="isLoading"
          @click="access"
        >
          {{ $t("access.mnemonic.submit") }}
        </v-btn>
        <router-link class="link" to="/access">
          {{ $t("access.mnemonic.cancel") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import * as bip39 from "bip39";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      isLoading: false,
      err: "",
      canSubmit: false,
    };
  },
  beforeUnmount() {
    (this.$refs.mnemonic_in as HTMLInputElement).value = "";
  },
  methods: {
    errCheck() {
      const phrase = this.getMnemonic();

      if (!phrase) {
        return;
      }

      const words = phrase.split(" ");

      // not a valid key phrase
      if (words.length !== 24) {
        this.err = `${this.$t("access.mnemonic.error")}`;
        return false;
      }

      const isValid = bip39.validateMnemonic(phrase);
      if (!isValid) {
        this.err =
          "Invalid mnemonic phrase. Make sure your mnemonic is all lowercase.";
        return false;
      }

      return true;
    },
    getWordCount() {
      const phrase = this.getMnemonic() || "";
      return phrase.trim().split(" ").length;
    },
    getMnemonic() {
      const inputVal = (this.$refs.mnemonic_in as HTMLInputElement).value;
      return inputVal.trim();
    },
    async access() {
      this.err = "";
      const phrase = this.getMnemonic();

      this.isLoading = true;

      if (!this.errCheck()) {
        this.isLoading = false;
        return;
      }

      setTimeout(async () => {
        try {
          await this.$store.dispatch("accessWallet", phrase);
          this.isLoading = false;
        } catch {
          this.isLoading = false;
          this.err = `${this.$t("access.mnemonic.error")}`;
        }
      }, 500);
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.mnemonic_auth {
  margin: 0px auto;
  width: max-content;
  padding: vars.$container-padding;

  .left,
  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

h1 {
  text-align: center;
  font-weight: 700;
  color: var(--tertiary-color);
  margin-bottom: 24px;
}

label {
  text-align: left;
  color: vars.$primary-color-light;
  font-size: 12px;
  margin-bottom: 20px;
}

textarea,
input[type="password"] {
  margin: 1em 0;
  max-width: 440px;
  width: 100%;
  background-color: var(--bg) !important;
  resize: none;
  padding: 1em 16px;
  font-size: 14px;
  color: var(--primary-color);
}

.phrase_disp {
  width: 100%;
  max-width: 560px;
  margin-bottom: vars.$vertical-padding;
}

.err {
  font-size: 13px;
  color: var(--error);
  text-align: center;
  margin: 14px 0px !important;
}

.remember {
  margin-top: -20px;
  font-size: 0.75em;
}

.key_in {
  margin: 30px auto;
  margin-bottom: 6px;
  width: 100%;
  font-size: 13px;
  background-color: vars.$white;
  border-radius: 4px;
}

.but_primary {
  margin-bottom: 15px;
}

.button_container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

@include mixins.mobile_device {
  .mnemonic_auth {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding: vars.$container-padding-mobile;

    .left,
    .right {
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
    }

    .left {
      order: 2;
    }

    .right {
      order: 1;
      margin-bottom: vars.$vertical-padding-mobile;
    }

    > * {
      width: 100%;
    }
  }

  h1 {
    text-align: center;
    font-size: vars.$m-size-mobile;
  }

  label {
    text-align: center;
    margin-bottom: 20px;
  }

  .phrase_disp {
    width: 100%;
    max-width: 560px;
    margin-bottom: vars.$vertical-padding-mobile;
  }

  .err {
    font-size: 13px;
    margin: 14px 0px !important;
  }

  .remember {
    margin-top: -20px;
    font-size: 0.75em;
  }

  .key_in {
    margin: 30px auto;
    margin-bottom: 6px;
    width: 100%;
    font-size: 13px;
  }

  .but_primary {
    margin: 0px auto;
    display: block;
    margin-top: 20px;
    margin-bottom: 15px;
  }

  .button_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
