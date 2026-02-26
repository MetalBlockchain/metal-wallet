<template>
  <tr class="utxo_row">
    <td class="col_explorer">
      <a v-if="explorerLink" :href="explorerLink" target="_blank">
        <fa icon="globe"></fa>
      </a>
    </td>
    <td class="col_id">
      <p>{{ utxo?.getUTXOID() }}</p>
    </td>
    <td>{{ typeName }}</td>
    <td class="col_locktime">{{ locktimeText }}</td>
    <td class="col_thresh">{{ out?.getThreshold() }}</td>
    <td class="col_owners">
      <p v-for="addr in addresses" :key="addr">{{ addr }}</p>
    </td>
    <td class="col_bal">
      <div>
        <p>{{ balanceText }}</p>
        <p>{{ symbol }}</p>
      </div>
    </td>
  </tr>
</template>
<script lang="ts">
import type {
  AmountOutput,
  UTXO as AVMUTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  UTXO as PlatformUTXO,
  StakeableLockOut,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { PropType } from "vue";
import type AvaAsset from "@/js/AvaAsset";
import type { AvaNetwork } from "@/js/AvaNetwork";
import { AVMConstants } from "@metalblockchain/metaljs/dist/apis/avm";
import { PlatformVMConstants } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";
import { ava, bintools } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useNetworkStore } from "@/stores/pinia/networks";

export const UTXORow = defineComponent({
  props: {
    utxo: {
      type: Object as PropType<AVMUTXO | PlatformUTXO>,
    },
    isX: { default: true, type: Boolean },
  },
  computed: {
    ...mapState(useAssetsStore, ["assetsDict", "nftFamsDict"]),
    ...mapState(useNetworkStore, ["selectedNetwork"]),
    out() {
      return this.utxo?.getOutput();
    },
    typeID(): number {
      return this.out?.getTypeID() ?? 0;
    },
    addresses(): string[] {
      const addrs = this.out?.getAddresses() ?? [];

      const hrp = ava.getHRP();
      const id = this.isX ? "X" : "P";
      const addrsClean = addrs.map((addr) => {
        return bintools.addressToString(hrp, id, addr);
      });
      return addrsClean;
    },
    asset() {
      // if(this.typeID)
      const assetID = this.utxo?.getAssetID();
      if (!assetID) {
        return null;
      }
      const idClean = bintools.cb58Encode(assetID);

      const asset = this.assetsDict[idClean] || this.nftFamsDict[idClean];
      return asset;
    },
    explorerLink() {
      const net = this.selectedNetwork;
      if (!net) return null;
      const explorer = net.explorerSiteUrl;
      if (!explorer || !this.utxo) return null;
      return explorer + "/tx/" + bintools.cb58Encode(this.utxo.getTxID());
    },
    locktime() {
      if (!this.out) {
        return 0;
      }
      let locktime = this.out.getLocktime().toNumber();
      if (!this.isX && this.typeID === PlatformVMConstants.STAKEABLELOCKOUTID) {
        const stakeableLocktime = (this.out as StakeableLockOut)
          .getStakeableLocktime()
          .toNumber();
        locktime = Math.max(locktime, stakeableLocktime);
      }
      return locktime;
    },
    locktimeText() {
      const now = UnixNow().toNumber();
      const locktime = this.locktime;

      if (now >= locktime) {
        return "-";
      } else {
        const date = new Date(locktime * 1000);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      }
    },
    symbol() {
      if (!this.asset) return "-";
      return this.asset.symbol;
    },
    balanceText() {
      if (!this.asset) return "-";

      if (
        this.typeID === 7 ||
        this.typeID === PlatformVMConstants.STAKEABLELOCKOUTID
      ) {
        const out = this.out as AmountOutput;
        const denom = (this.asset as AvaAsset).denomination;
        const bn = out.getAmount();
        return bnToBig(bn, denom).toLocaleString();
      }

      if ([6, 7, 10, 11].includes(this.typeID)) {
        return 1;
      }

      return "-";
    },
    typeName(): string {
      switch (this.typeID) {
        case AVMConstants.SECPMINTOUTPUTID: {
          return "SECP Mint Output";
        }
        case AVMConstants.SECPXFEROUTPUTID: {
          return "SECP Transfer Output";
        }
        case AVMConstants.NFTMINTOUTPUTID: {
          return "NFT Mint Output";
        }
        case AVMConstants.NFTXFEROUTPUTID: {
          return "NFT Transfer Output";
        }
        case PlatformVMConstants.STAKEABLELOCKOUTID: {
          return "Stakeable Lock Output";
        }
      }
      return "";
    },
  },
});
export default UTXORow;
</script>
<style scoped lang="scss">
tr {
  font-size: 12px;
}

td {
  padding: 0;
}

.col_id {
  p {
    width: 80px;
    overflow: auto;
    text-overflow: ellipsis;
  }
}
.col_bal {
  > div {
    display: grid;
    grid-template-columns: 1fr 50px;
  }
}

.utxo_row {
  border-bottom: 1px solid var(--bg-light);

  &:hover {
    td {
      background-color: var(--bg-light);
    }
  }
}

.col_owners {
  //word-break: break-all;
  > p {
    text-overflow: ellipsis;
  }
}

.col_explorer {
  text-align: center;
  a {
    color: var(--primary-color-light);

    &:hover {
      color: var(--secondary-color);
    }
  }
}
</style>
