<template>
  <div class="custom_network">
    <form @submit.prevent="">
      <div>
        <label>Network Name</label>
        <input v-model="name" placeholder="Network Name" type="text" />
      </div>
      <div>
        <label>URL</label>
        <input
          v-model="url"
          placeholder="http://localhost:9650"
          type="text"
          @input="checkUrl"
        />
        <p v-if="err_url" class="form_error">{{ err_url }}</p>
      </div>
      <div>
        <label>Explorer API (optional)</label>
        <input
          v-model="explorer_api"
          placeholder="www"
          type="text"
          @input="cleanExplorerUrl"
        />
      </div>
      <div>
        <label>Explorer Site (optional)</label>
        <input
          v-model="explorer_site"
          placeholder="www"
          type="text"
          @input="cleanExplorerSite"
        />
      </div>
      <div class="rowGroup">
        <div>
          <label>Network ID</label>
          <input
            v-model.number="networkId"
            placeholder="Network ID"
            type="number"
          />
        </div>
      </div>
      <p v-if="err" class="form_error">{{ err }}</p>
      <button class="button_primary" @click="saveNetwork">Save Changes</button>
      <!--            <button @click="deleteNetwork" class="del_button">Delete Network</button>-->
    </form>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { AvaNetwork } from "@/js/AvaNetwork";
import punycode from "punycode";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { useNetworkStore } from "@/stores/pinia/networks";
import { useNotificationsStore } from "@/stores/pinia/notifications";

export default defineComponent({
  props: {
    net: {
      type: Object as PropType<AvaNetwork | null>,
    },
  },
  emits: ["success", "delete"],
  data() {
    const explorer_site: string | undefined = "";
    const explorer_api: string | undefined = "";

    return {
      name: "My Custom Network",
      url: "",
      networkId: 12_345,
      explorer_api,
      explorer_site,
      chainId: "X",
      err: null,
      err_url: "",
    };
  },
  mounted() {
    const net = this.net;

    if (net) {
      this.name = net.name;
      this.url = net.getFullURL();
      this.networkId = net.networkId;
      this.explorer_api = net.explorerUrl ?? "";
      this.explorer_site = net.explorerSiteUrl ?? "";
    }
  },
  methods: {
    ...mapActions(useNetworkStore, {
      networkSave: "save",
    }),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    cleanExplorerUrl() {
      // console.log(val);
      const url = this.explorer_api as string;
      this.explorer_api = punycode.toASCII(url);
    },
    cleanExplorerSite() {
      let url = this.explorer_site as string;
      url = punycode.toASCII(url);
      this.explorer_site = url;
    },
    checkUrl() {
      let url = this.url;
      // protect against homograph attack: https://hethical.io/homograph-attack-using-internationalized-domain-name/
      url = punycode.toASCII(url);
      this.url = url;

      // must contain http / https prefix
      if (url.slice(0, 7) !== "http://" && url.slice(0, 8) !== "https://") {
        this.err_url = "URLs require the appropriate HTTP/HTTPS prefix.";
        return false;
      }

      const split = url.split("://");
      const rest = split[1];

      // must have base ip
      if (!rest || rest.length === 0) {
        this.err_url = "Invalid URL.";
        return false;
      }

      // Must have port
      if (!rest.includes(":")) {
        this.err_url = "You must specify the port of the url.";
        return false;
      }
      // Port must be number

      const urlSplit = rest.split(":");
      if (urlSplit.length === 0) {
        this.err_url = "Invalid port.";
        return false;
      }

      if (urlSplit[1]) {
        const port = Number.parseInt(urlSplit[1]);

        if (Number.isNaN(port)) {
          this.err_url = "Invalid port.";
          return false;
        }
      }

      this.err_url = "";
      return true;
    },
    errCheck() {
      let err = null;

      // check for HTTP HTTPS on url
      const url = this.url;

      if (url.slice(0, 7) !== "http://" && url.slice(0, 8) !== "https://") {
        err = "URLs require the appropriate HTTP/HTTPS prefix.";
      }

      if (!this.name) err = "You must give the network a name.";
      else if (!this.url) err = "You must set the URL.";
      else if (!this.chainId) err = "You must set the chain id.";
      else if (!this.networkId) err = "You must set the network id.";

      return err;
    },
    deleteNetwork() {
      this.$emit("delete");
    },
    async saveNetwork() {
      const net = this.net;
      if (net) {
        net.name = this.name;
        net.updateURL(this.url);
        net.explorerUrl = this.explorer_api;
        net.explorerSiteUrl = this.explorer_site;
        net.networkId = this.networkId;

        this.networkSave();

        this.addNotification({
          title: "Changes Saved",
          message: "Network settings updated.",
        });

        this.$emit("success");
      }
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";

.custom_network {
  padding: 0px 15px;
  padding-bottom: 15px;
}

.header {
  border-bottom: 1px solid vars.$background-color;
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

form {
  margin-top: 12px;
  label {
    font-size: 12px;
  }
  > div {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
  }
}

input,
select {
  background-color: var(--bg-light);
  color: var(--primary-color);
  border-radius: 4px;
  padding: 6px 6px;
  font-size: 13px;
  outline: none;
  width: 100%;
}
button {
  margin-top: 10px;
  width: 100%;
  background-color: vars.$primary-color;
  color: #fff;
  font-size: 12px;
  padding: 3px 14px;
  border-radius: 4px;
}

.rowGroup {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  > * {
    margin-right: 5px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  > div {
    width: 100%;
  }
}

.form_error {
  font-size: 12px;
  color: #e03737;
}
</style>
