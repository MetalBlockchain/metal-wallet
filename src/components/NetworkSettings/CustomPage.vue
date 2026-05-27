<template>
  <div class="custom_network">
    <form @submit.prevent="submit">
      <div>
        <label>{{ $t("network.custom_page.label1") }}</label>
        <input
          v-model="name"
          data-cy="custom-network-name"
          placeholder="Network Name"
          type="text"
        />
      </div>
      <div>
        <label>URL</label>
        <input
          v-model="url"
          data-cy="custom-network-url"
          placeholder="http://localhost:9650"
          type="text"
          @input="checkUrl"
        />
        <p v-if="err_url" class="form_error">{{ err_url }}</p>
      </div>
      <div>
        <label>{{ $t("network.custom_page.label2") }}</label>
        <input
          v-model="explorer_api"
          placeholder="www"
          type="text"
          @input="cleanExplorerUrl"
        />
      </div>
      <div>
        <label>{{ $t("network.custom_page.label3") }}</label>
        <input
          v-model="explorer_site"
          placeholder="www"
          type="text"
          @input="cleanExplorerSite"
        />
      </div>
      <p v-if="err" class="form_error">{{ err }}</p>
      <v-btn
        class="button_primary"
        data-cy="custom-network-add"
        depressed
        height="26"
        :loading="isAjax"
        type="submit"
      >
        {{ $t("network.add") }}
      </v-btn>
    </form>
  </div>
</template>
<script lang="ts">
import punycode from "punycode";
import axios from "axios";
import { defineComponent } from "vue";
import { AvaNetwork } from "@/js/AvaNetwork";

export default defineComponent({
  emits: ["add"],
  data(): {
    name: string;
    url: string;
    explorer_api: string;
    explorer_site: string;
    err: string | null;
    err_url: string;
    isAjax: boolean;
  } {
    const err: null | string = null;

    return {
      name: "My Custom Network",
      url: "",
      explorer_api: "",
      explorer_site: "",
      err,
      err_url: "",
      isAjax: false,
    };
  },
  methods: {
    cleanExplorerUrl() {
      let url = this.explorer_api;
      url = punycode.toASCII(url);
      this.explorer_api = url;
    },
    cleanExplorerSite() {
      let url = this.explorer_site;
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

      return err;
    },
    async tryConnection(credential = false): Promise<number | null> {
      try {
        const resp = await axios.post(
          this.url + "/ext/info",
          {
            jsonrpc: "2.0",
            id: 1,
            method: "info.getNetworkID",
          },
          {
            withCredentials: credential,
          },
        );
        return Number.parseInt(resp.data.result.networkID);
      } catch {
        return null;
      }
    },
    async submit() {
      this.err = null;
      const err = this.errCheck();

      if (err) {
        this.err = err;
        return;
      }

      // let netID = null

      this.isAjax = true;
      const credNum = await this.tryConnection(true);
      const noCredNum = await this.tryConnection();
      this.isAjax = false;

      const validNetId = credNum || noCredNum;

      if (!validNetId) {
        this.err = "Metal Network Not Found";
        return;
      }

      const net = new AvaNetwork(
        this.name,
        this.url,
        validNetId,
        this.explorer_api,
        this.explorer_site,
      );

      this.$emit("add", net);

      // Clear values
      this.name = "My Custom Network";
      this.url = "";
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
  color: var(--primary-color);
  background-color: var(--bg-light);
  border-radius: 4px;
  padding: 6px 6px;
  font-size: 13px;
  outline: none;
}
button {
  margin-top: 10px;
  width: 100%;
  font-size: 12px;
  border-radius: 4px;
}

.v-btn {
  text-transform: none;
  font-size: 12px !important;
  color: var(--bg) !important;
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
}

.form_error {
  font-size: 12px;
  color: #e03737;
}
</style>
