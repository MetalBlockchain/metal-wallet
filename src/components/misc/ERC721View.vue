<template>
  <div class="erc721_view">
    <img v-if="!isError && img" :src="parseURL(img)" />
    <div v-if="isError" class="err_cont">
      <p>
        <fa icon="unlink"></fa>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type ERC721Token from "@/js/ERC721Token";
import { defineComponent } from "vue";

// If an image url is hosted on one of these urls, reroute through cloudflare.
const REDIRECT_DOMAINS = ["gateway.pinata.cloud/ipfs"];
const CF_IPFS_BASE = "https://cloudflare-ipfs.com/ipfs/";
export default defineComponent({
  props: {
    index: {
      type: String,
    },
    token: {
      type: Object as PropType<ERC721Token>,
    },
  },
  data() {
    const metadata: any = {};

    return {
      metadata,
      isError: false,
    };
  },
  computed: {
    img() {
      const data = this.metadata;
      if (!data) return null;
      return data.img || data.image || null;
    },
  },
  watch: {
    token: [
      {
        handler: "onIndexChange",
      },
    ],
    index: [
      {
        handler: "onIndexChange",
      },
    ],
  },
  mounted() {
    this.getData();
  },
  methods: {
    parseURL(val: string) {
      const isRedirect = REDIRECT_DOMAINS.reduce((acc, domain) => {
        if (acc) return acc;
        if (val.includes(domain)) return true;
        return false;
      }, false);

      if (isRedirect) {
        const ipfsHash = val.split("ipfs/")[1];
        return CF_IPFS_BASE + ipfsHash;
      }
      return val;
    },
    async getData() {
      if (this.token) {
        try {
          this.metadata = await this.token.getTokenURIData(
            Number.parseInt(this.index ?? ""),
          );
          this.isError = false;
        } catch {
          this.isError = true;
        }
      }
    },
    onIndexChange() {
      this.getData();
    },
  },
});
</script>
<style scoped lang="scss">
.erc721_view {
  width: 100%;
  height: 100%;
}
img,
.err_cont {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.err_cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000;
  text-align: center;
}
</style>
