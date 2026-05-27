<template>
  <div class="add_key_file">
    <label>{{ $t("keystore.title") }}</label>
    <form @submit.prevent="importKeyfile">
      <file-input ref="fileIn" class="formIn" @change="onfile"></file-input>
      <label>{{ $t("keys.export_placeholder1") }}</label>
      <v-text-field
        v-model="pass"
        class="formIn"
        dense
        hide-details
        outlined
        :placeholder="$t('keys.export_placeholder1')"
        type="password"
      ></v-text-field>
      <p v-if="err" class="err">{{ err }}</p>
      <v-btn
        block
        class="addKeyBut button_primary ava_button"
        depressed
        :disabled="!canSubmit"
        :loading="isLoading"
        type="submit"
      >
        {{ $t("keys.import_key_button") }}
      </v-btn>
    </form>
  </div>
</template>
<script lang="ts">
import type { AllKeyFileTypes } from "@/js/IKeystore";
import type { ImportKeyfileInput } from "@/stores/types";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import FileInput from "@/components/misc/FileInput.vue";
import { KEYSTORE_VERSION } from "@/js/Keystore";
import { useRootStore } from "@/stores/pinia/root";

export const AddKeyFile = defineComponent({
  components: {
    FileInput,
  },
  emits: ["success"],
  data(): {
    canAdd: boolean;
    pass: string;
    keyfile: File | null;
    isLoading: boolean;
    err: string | null;
    fileText: string | null;
  } {
    const fileText: string | null = null;
    const err: string | null = null;
    const keyfile: File | null = null;

    return {
      canAdd: false,
      pass: "",
      keyfile,
      isLoading: false,
      err,
      fileText,
    };
  },
  computed: {
    canSubmit() {
      return this.keyfile && this.pass && this.fileText ? true : false;
    },
    fileIn() {
      return this.$refs.fileIn as typeof FileInput;
    },
  },
  methods: {
    ...mapActions(useRootStore, { importKeyfileRoot: "importKeyfile" }),
    onfile(val: File) {
      this.keyfile = val;

      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const res = reader.result as string;
        this.fileText = res;
      });
      // eslint-disable-next-line unicorn/prefer-blob-reading-methods
      reader.readAsText(val);
    },
    importKeyfile() {
      let fileData: AllKeyFileTypes;
      this.err = null;

      try {
        fileData = JSON.parse(this.fileText as string);
      } catch {
        this.err = "Unable to parse JSON file.";
        return;
      }

      if (fileData.version != KEYSTORE_VERSION) {
        // TODO: update here?
        this.err =
          "Tried to import an old keystore version. Please update your keystore file before importing.";
        return;
      }

      this.isLoading = true;

      setTimeout(() => {
        const input: ImportKeyfileInput = {
          password: this.pass,
          data: fileData,
        };

        try {
          this.importKeyfileRoot(input);
          this.$emit("success");
          this.clear();
        } catch (error) {
          this.isLoading = false;
          this.err =
            error === "INVALID_PASS"
              ? "Invalid password."
              : "Failed to read keystore file.";
        }
      }, 200);
    },
    clear() {
      this.isLoading = false;
      this.pass = "";
      this.keyfile = null;
      this.canAdd = false;
      this.err = null;
      this.fileIn.clear();
    },
  },
});
export default AddKeyFile;
</script>
<style lang="scss">
.add_key_file {
  fieldset {
    border: none !important;
  }
}
</style>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";

.add_key_file {
  padding: 14px 0;
}

.addKeyBut {
  text-transform: none;
  border-radius: 2px;
  margin-top: 14px;
}

label {
  font-size: 12px;
  color: vars.$primary-color-light;
}

.err {
  color: var(--error);
  margin: 4px 0px;
  font-size: 12px;
}

.formIn {
  height: 40px;
  font-size: 12px;
  background-color: var(--bg-light) !important;
  border-radius: 2px;
}
</style>
<style lang="scss">
.add_key_file {
  .formIn .v-input__slot {
    background-color: var(--bg-light) !important;
  }
}
</style>
