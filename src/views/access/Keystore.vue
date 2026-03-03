<template>
  <div class="access_card">
    <div class="content">
      <h1>{{ $t("keystore.title") }}</h1>
      <div class="input_area">
        <file-input class="file_in" @change="onfile"></file-input>
      </div>
      <form @submit.prevent="access">
        <v-text-field
          v-if="file"
          v-model="pass"
          class="pass"
          dense
          flat
          hide-details
          :label="$t('password')"
          solo
          type="password"
        ></v-text-field>
        <p class="err">{{ error }}</p>
        <!--                <remember-key class="remember" v-model="rememberPass" v-if="file" @is-valid="isRememberValid"></remember-key>-->
        <v-btn
          v-if="file"
          class="ava_button button_secondary"
          depressed
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="access"
        >
          {{ $t("access.mnemonic.submit") }}
        </v-btn>
      </form>
      <router-link class="link" to="/access">{{
        $t("access.cancel")
      }}</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import type { AllKeyFileTypes } from "@/js/IKeystore";
import type { ImportKeyfileInput } from "@/stores/types";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import FileInput from "@/components/misc/FileInput.vue";
import { useRootStore } from "@/stores/pinia/root";

export const Keystore = defineComponent({
  components: {
    FileInput,
  },
  data(): {
    pass: string;
    file: File | null;
    fileText: string | null;
    isLoading: boolean;
    error: string;
  } {
    return {
      pass: "",
      file: null,
      fileText: null,
      isLoading: false,
      error: "",
    };
  },
  computed: {
    canSubmit(): boolean {
      if (!this.file || !this.pass || !this.fileText) {
        return false;
      }

      return true;
    },
  },
  methods: {
    ...mapActions(useRootStore, ["importKeyfile"]),
    onfile(val: File) {
      this.file = val;
      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const res = reader.result as string;
        this.fileText = res;
      });
      // eslint-disable-next-line unicorn/prefer-blob-reading-methods
      reader.readAsText(val);
    },
    access() {
      if (!this.canSubmit || this.isLoading) return;

      this.error = "";

      let fileData: AllKeyFileTypes;
      try {
        fileData = JSON.parse(this.fileText as string);
      } catch {
        this.error = `${this.$t("access.json_error")}`;
        return;
      }

      // console.log(this.fileText);
      // return;

      // let rememberPass = this.rememberPass;
      const data: ImportKeyfileInput = {
        password: this.pass,
        data: fileData,
      };

      this.isLoading = true;

      setTimeout(() => {
        this.importKeyfile(data)
          .then(() => {
            this.isLoading = false;
          })
          .catch((error) => {
            console.log(error);
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
  },
});
export default Keystore;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.pass {
  // background-color: var(--bg) !important;
}
.ava_button {
  width: 100%;
  margin-bottom: 22px;
}
.access_card {
  /*max-width: 80vw;*/
  padding: vars.$container-padding;
  width: 100%;
  /*max-width: 240px;*/
  /*max-width: 1000px;*/
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}

.input_area {
  border: 2px dashed var(--gray300);
  border-radius: 6px;
  margin-bottom: 24px;
}

.content {
  width: 340px;
  max-width: 100%;
  margin: 0px auto;
}

h1 {
  font-size: vars.$m-size;
  font-weight: 700;
  color: var(--tertiary-color);
  margin-bottom: 24px;
}

.file_in {
  // margin: 10px auto 10px;
  padding: 20px 0;
  font-size: 13px;
  border: none !important;
  background-color: var(--bg) !important;
  /*min-width: 200px*/
}

a {
  color: vars.$primary-color-light !important;
  text-decoration: underline !important;
  margin: 10px 0 20px;
}

.link {
  color: var(--secondary-color) !important;
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
