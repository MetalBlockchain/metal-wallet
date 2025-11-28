<template>
  <modal ref="modal" :title="title" @before-close="beforeClose">
    <div class="add_key_body">
      <img class="bg" src="@/assets/import_key_bg.png" />
      <p class="explain">Add additional keys to use with your wallet.</p>
      <v-tabs
        v-model="selectedTab"
        :centered="true"
        :grow="true"
        height="38"
        :mobile-breakpoint="900"
        :show-arrows="false"
      >
        <v-tab key="mnemonic">{{ $t("keys.import_key_option1") }}</v-tab>
        <v-tab key="keystore">{{ $t("keys.import_key_option2") }}</v-tab>
        <v-tab key="priv_key">{{ $t("keys.import_key_option3") }}</v-tab>
        <v-window-item>
          <AddMnemonic
            ref="mnemonic"
            @success="handleImportSuccess"
          ></AddMnemonic>
        </v-window-item>
        <v-window-item>
          <add-key-file
            ref="keyfile"
            @success="handleImportSuccess"
          ></add-key-file>
        </v-window-item>
        <v-window-item>
          <add-key-string
            ref="keyString"
            @success="handleImportSuccess"
          ></add-key-string>
        </v-window-item>
      </v-tabs>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import AddKeyFile from "@/components/wallet/manage/AddKeyFile.vue";
import AddKeyString from "@/components/wallet/manage/AddKeyString.vue";
import AddMnemonic from "@/components/wallet/manage/AddMnemonic.vue";

export default defineComponent({
  components: {
    Modal,
    AddKeyFile,
    AddKeyString,
    AddMnemonic,
  },
  data() {
    return {
      title: "",
      selectedTab: "",
    };
  },
  created() {
    this.title = this.$t("keys.import_key_title") as string;
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
      this.selectedTab = "private"; // explicitly set v-model value for modal
    },
    beforeClose() {
      (this.$refs.keyfile as typeof AddKeyFile)?.clear();
      (this.$refs.keyString as typeof AddKeyString)?.clear();
      (this.$refs.mnemonic as typeof AddMnemonic)?.clear();
    },
    handleImportSuccess() {
      (this.$refs.modal as typeof Modal).close();
      this.$store.dispatch("Notifications/add", {
        title: this.$t("keys.import_key_success_title"),
        message: this.$t("keys.import_key_success_msg"),
      });
    },
  },
});
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.add_key_body {
  padding: 30px;
  max-width: 450px;
  min-height: 315px;
}

.close_but {
  position: absolute;
  top: 12px;
  right: 20px;
  background-color: transparent;
  border: none;
  outline: none;
  opacity: 0.2;

  &:hover {
    opacity: 1;
  }
}

.bg {
  display: block;
  max-height: 50px;
  object-fit: contain;
  width: 100%;
  //margin: 12px auto;
}

.explain {
  text-align: center;
  margin: 14px 0 !important;
}

@include mixins.mobile-device {
  .add_key_body {
    max-width: 100%;
  }
}
</style>

<style lang="scss">
@use "@/styles/abstracts/vars";

.v-tab.v-tab {
  font-weight: 700;
}

.v-tabs-slider-wrapper {
  color: vars.$secondary-color;
  caret-color: vars.$secondary-color;
  height: 3px !important;
}
</style>
