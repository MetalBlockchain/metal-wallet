<template>
  <div class="nft_card">
    <ERC721ViewModal
      ref="view_modal"
      :token="token"
      :token-id="index"
    ></ERC721ViewModal>
    <div class="view">
      <template v-if="!isRaw && img">
        <ERC721View :index="index" :token="token"></ERC721View>
      </template>
      <template v-else>
        <div class="raw_view no_scroll_bar">
          <p>{{ metadata }}</p>
        </div>
      </template>
    </div>
    <div class="nft_info">
      <div class="meta_bar">
        <div>
          <p>ERC721</p>
        </div>
        <div>
          <button class="raw_toggle" :data-active="isRaw" @click="toggleRaw">
            SOURCE
          </button>
          <Tooltip
            class="nft_button"
            :text="$t('portfolio.collectibles.send')"
            @click="transfer"
          >
            <fa icon="share"></fa>
          </Tooltip>
          <Tooltip
            class="nft_button"
            :text="$t('portfolio.collectibles.expand')"
            @click="expand"
          >
            <fa icon="expand"></fa>
          </Tooltip>
        </div>
      </div>
      <div v-if="name || description" class="generic_nft_meta">
        <p v-if="name" class="nft_title">
          {{ name }}
        </p>
        <p v-if="description" class="nft_desc">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type ERC721Token from "@/js/ERC721Token";
import axios from "axios";
import { defineComponent } from "vue";
import ERC721View from "@/components/misc/ERC721View.vue";
import Tooltip from "@/components/misc/Tooltip.vue";
import ERC721ViewModal from "@/components/modals/ERC721ViewModal.vue";

export default defineComponent({
  components: { ERC721ViewModal, ERC721View, Tooltip },
  props: {
    index: {
      type: String,
    },
    token: {
      type: Object as PropType<ERC721Token>,
    },
  },
  data() {
    const metadata: any = "";

    return {
      metadata,
      isRaw: false,
    };
  },
  computed: {
    img() {
      const data = this.metadata;
      if (!data) return null;
      return data.img || data.image || null;
    },
    name() {
      return this.metadata?.name;
    },
    description() {
      return this.metadata?.description;
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      if (this.token) {
        try {
          const uri = await this.token.getTokenURI(
            Number.parseInt(this.index ?? ""),
          );
          this.metadata = (await axios.get(uri)).data;
        } catch {
          this.metadata = null;
        }
      }
    },
    transfer(ev: any) {
      ev.stopPropagation();
      this.$router.push({
        path: "/wallet/transfer",
        query: {
          chain: "C",
          token: this.token?.contractAddress,
          tokenId: this.index,
        },
      });
    },
    expand() {
      (this.$refs.view_modal as typeof ERC721ViewModal).open();
    },
    toggleRaw() {
      this.isRaw = !this.isRaw;
    },
  },
});
</script>
<style scoped lang="scss">
@use "nft_card";

img {
  width: 100%;
  object-fit: contain;
}

.raw_view {
  overflow: scroll;
  background-color: #000;
  height: 100%;
  padding: 12px;
  font-size: 12px;
  word-break: break-all;
  color: #0f0;
}

.raw_toggle {
  &[data-active="true"] {
    color: var(--secondary-color) !important;
    opacity: 1 !important;
    font-weight: bold;
  }
}
</style>
