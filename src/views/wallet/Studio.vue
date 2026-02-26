<template>
  <div>
    <div class="header">
      <div class="header_title">
        <h1>{{ $t("studio.title") }}</h1>
        <hr />
      </div>
      <h1 v-if="pageNow" class="subtitle">
        / {{ subtitle }}
        <span @click="cancel"><fa icon="times"></fa></span>
      </h1>
    </div>
    <template v-if="!pageNow">
      <p class="studio_desc">{{ $t("studio.desc") }}</p>
      <div class="menu">
        <h2>{{ $t("studio.collectibles") }}</h2>
        <div class="options">
          <div>
            <h4 class="title">{{ $t("studio.menu1.title") }}</h4>
            <p>{{ $t("studio.menu1.desc") }}</p>
            <v-btn
              class="button_secondary"
              depressed
              small
              @click="goNewNftFamily"
            >
              {{ $t("studio.menu1.submit") }}
            </v-btn>
          </div>
          <div>
            <h4 class="title">{{ $t("studio.menu2.title") }}</h4>
            <p>{{ $t("studio.menu2.desc") }}</p>
            <div>
              <p v-if="!canMint" class="err">
                {{ $t("studio.menu2.empty") }}
              </p>
              <v-btn
                class="button_secondary"
                depressed
                :disabled="!canMint"
                small
                @click="goMint"
              >
                {{ $t("studio.menu2.submit") }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </template>
    <Component :is="pageNow" v-else @cancel="cancel"></Component>
  </div>
</template>

<script lang="ts">
import type { IWalletNftMintDict } from "@/stores/types";
import { defineComponent } from "vue";
import MintNft from "@/components/wallet/studio/mint/MintNft.vue";
import NewCollectibleFamily from "@/components/wallet/studio/NewCollectibleFamily.vue";

export const Studio = defineComponent({
  name: "Studio",
  components: {
    NewCollectibleFamily,
  },
  data() {
    const pageNow: any = null;

    return {
      pageNow,
      subtitle: "",
    };
  },
  computed: {
    nftMintDict(): IWalletNftMintDict {
      return this.$store.getters["Assets/nftMintDict"];
    },
    canMint(): boolean {
      const keys = Object.keys(this.nftMintDict);
      if (keys.length > 0) return true;
      return false;
    },
  },
  activated() {
    const utxoId = this.$route.query.utxo;

    if (utxoId) {
      this.goMint();
    }
  },
  deactivated() {
    this.clearPage();
  },
  methods: {
    goNewNftFamily() {
      this.pageNow = NewCollectibleFamily;
      this.subtitle = "New Collectible Family";
    },
    goMint() {
      this.pageNow = MintNft;
      this.subtitle = "Mint Collectible";
    },
    clearUrl() {
      const utxoId = this.$route.query.utxo;

      if (utxoId) {
        this.$router.replace({ query: undefined });
      }
    },
    clearPage() {
      this.pageNow = null;
      this.subtitle = "";
    },
    cancel() {
      this.clearUrl();
      this.clearPage();
    },
  },
});
export default Studio;
</script>
<style scoped lang="scss">
.studio_desc {
  font-size: 14px;
  font-weight: 400;
}
.header {
  display: flex;
  /*justify-content: space-between;*/
  /*align-items: center;*/
  align-items: center;

  .header_title {
    display: flex;
    flex-direction: row;
    align-items: center;

    h1 {
      font-size: 20px;
      font-weight: 500;
      white-space: nowrap;
      margin-right: 12px;
      color: var(--tertiary-color);
    }

    hr {
      flex: 0 1 100%;
      border: 1px solid var(--border-secondary-light);
    }
  }

  .subtitle {
    margin-left: 0.5em;
    font-size: 20px;
    color: var(--primary-color-light);
    font-weight: 400;
  }

  span {
    margin-left: 1em;

    &:hover {
      color: var(--primary-color);
      cursor: pointer;
    }
  }
}

.menu {
  h2 {
    margin: 20px 0;
    color: var(--primary-color-light);
    font-weight: normal;
    font-size: 2em;
  }
}

.options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 14px;
  > div {
    border-radius: 4px;
    border: 1px solid var(--bg-light);
    background-color: var(--bg-light);
    padding: 30px;
    display: flex;
    flex-direction: column;

    &:hover {
      background-color: var(--bg-light);
    }
  }

  p {
    flex-grow: 1;
    margin: 12px 0 !important;
  }

  h4 {
    font-size: 32px !important;
    font-weight: lighter;
    color: var(--primary-color-light);
  }

  .v-btn {
    width: max-content;
  }
}
</style>
