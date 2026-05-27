<template>
  <div v-if="isBanned" class="nft_payload_view"></div>
  <NftPayloadAllow
    v-else-if="!isShow"
    v-model="isShow"
    :is-small="small"
    :nft-i-d="payloadID"
  ></NftPayloadAllow>
  <Component
    :is="viewer"
    v-else-if="!small"
    class="nft_payload_view"
    :payload="payload"
  ></Component>
  <template v-else>
    <Component
      :is="viewer"
      v-if="!small"
      class="nft_payload_view"
      :payload="payload"
    ></Component>
    <Component
      :is="viewerSmall"
      v-else
      class="nft_payload_view"
      :payload="payload"
    ></Component>
  </template>
</template>
<script lang="ts">
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { isUrlBanned } from "@/components/misc/NftPayloadView/blacklist";
import NftPayloadAllow from "@/components/misc/NftPayloadView/NftPayloadAllow.vue";
import JsonPayloadView from "@/components/misc/NftPayloadView/views/JsonPayloadView.vue";
import UrlPayloadView from "@/components/misc/NftPayloadView/views/UrlPayloadView.vue";
import UtfPayloadView from "@/components/misc/NftPayloadView/views/UtfPayloadView.vue";
import JsonPayloadViewSmall from "@/components/misc/NftPayloadView/views_small/JsonPayloadViewSmall.vue";
import UrlPayloadViewSmall from "@/components/misc/NftPayloadView/views_small/UrlPayloadViewSmall.vue";
import UtfPayloadViewSmall from "@/components/misc/NftPayloadView/views_small/UtfPayloadViewSmall.vue";
import { useAssetsStore } from "@/stores/pinia/assets";
import { payloadToHash } from "@/utils/payloadToHash";

export default defineComponent({
  components: {
    NftPayloadAllow,
    UrlPayloadView,
    UtfPayloadView,
    JsonPayloadView,
    UrlPayloadViewSmall,
    UtfPayloadViewSmall,
    JsonPayloadViewSmall,
  },
  props: {
    payload: {
      type: Object as PropType<PayloadBase>,
    },
    small: { default: false, type: Boolean },
  },
  data() {
    return {
      isShow: false,
    };
  },
  computed: {
    ...mapState(useAssetsStore, ["nftWhitelist"]),
    payloadID() {
      const str = this.content;
      return payloadToHash(str);
    },

    content() {
      return this.payload?.getContent().toString() ?? "";
    },
    isBanned() {
      return isUrlBanned(this.content);
    },
    typeID() {
      return this.payload?.typeID() ?? "";
    },
    viewer(): any {
      const typeID = this.typeID;
      switch (typeID) {
        case 1: {
          // UTF 8
          return UtfPayloadView;
        }
        case 27: {
          // url
          return UrlPayloadView;
        }
        case 24: {
          // JSON
          return JsonPayloadView;
        }
        default: {
          return UtfPayloadView;
        }
      }
    },
    viewerSmall(): any {
      const typeID = this.typeID;
      switch (typeID) {
        case 1: {
          // UTF 8
          return UtfPayloadViewSmall;
        }
        case 27: {
          // url
          return UrlPayloadViewSmall;
        }
        case 24: {
          // JSON
          return JsonPayloadViewSmall;
        }
        default: {
          return UtfPayloadViewSmall;
        }
      }
    },
  },
  watch: {
    nftWhitelist: [
      {
        handler: "onListChange",
      },
    ],
  },
  mounted() {
    if (this.nftWhitelist) {
      this.onListChange();
    }
  },
  methods: {
    onListChange() {
      if (this.nftWhitelist.includes(this.payloadID)) {
        this.isShow = true;
      }
    },
  },
});
</script>
<style scoped>
.nft_payload_view {
  overflow: auto;
}
</style>
