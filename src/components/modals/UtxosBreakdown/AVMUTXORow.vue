<template>
  <tr class="utxo_row">
    <td class="col_explorer">
      <a :href="explorerLink" v-if="explorerLink" target="_blank">
        <fa icon="globe"></fa>
      </a>
    </td>
    <td class="col_id">
      <p>{{ utxo.getUTXOID() }}</p>
    </td>
    <td>{{ typeName }}</td>
    <td class="col_locktime">{{ locktimeText }}</td>
    <td class="col_thresh">{{ out.getThreshold() }}</td>
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
import { Vue, Component, Prop } from "vue-property-decorator";
import type {
  AmountOutput,
  UTXO as AVMUTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import { AVMConstants } from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  StakeableLockOut,
  UTXO as PlatformUTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import { PlatformVMConstants } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { ava, bintools } from "@/AVA";
import type AvaAsset from "@/js/AvaAsset";
import { bnToBig } from "@/helpers/helper";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import type { AvaNetwork } from "@/js/AvaNetwork";

@Component
export class UTXORow extends Vue {
  @Prop() utxo!: AVMUTXO | PlatformUTXO;
  @Prop({ default: true }) isX!: boolean;

  get out() {
    return this.utxo.getOutput();
  }

  get typeID(): number {
    return this.out.getTypeID();
  }

  get addresses(): string[] {
    const addrs = this.out.getAddresses();

    const hrp = ava.getHRP();
    const id = this.isX ? "X" : "P";
    const addrsClean = addrs.map((addr) => {
      return bintools.addressToString(hrp, id, addr);
    });
    return addrsClean;
  }
  // get typeName() {
  //     return this.utxo.getTypeID()
  // }
  get asset() {
    // if(this.typeID)
    const assetID = this.utxo.getAssetID();
    const idClean = bintools.cb58Encode(assetID);

    const asset =
      this.$store.state.Assets.assetsDict[idClean] ||
      this.$store.state.Assets.nftFamsDict[idClean];
    return asset;
  }

  get explorerLink() {
    const net: AvaNetwork = this.$store.state.Network.selectedNetwork;
    const explorer = net.explorerSiteUrl;
    if (!explorer) return null;
    return explorer + "/tx/" + bintools.cb58Encode(this.utxo.getTxID());
  }

  get locktime() {
    let locktime = this.out.getLocktime().toNumber();
    if (!this.isX && this.typeID === PlatformVMConstants.STAKEABLELOCKOUTID) {
      const stakeableLocktime = (this.out as StakeableLockOut)
        .getStakeableLocktime()
        .toNumber();
      locktime = Math.max(locktime, stakeableLocktime);
    }
    return locktime;
  }
  get locktimeText() {
    const now = UnixNow().toNumber();
    const locktime = this.locktime;

    if (now >= locktime) {
      return "-";
    } else {
      const date = new Date(locktime * 1000);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }
  }

  get symbol() {
    if (!this.asset) return "-";
    return this.asset.symbol;
  }

  get balanceText() {
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
  }

  get typeName(): string {
    PlatformVMConstants;
    switch (this.typeID) {
      case AVMConstants.SECPMINTOUTPUTID:
        return "SECP Mint Output";
      case AVMConstants.SECPXFEROUTPUTID:
        return "SECP Transfer Output";
      case AVMConstants.NFTMINTOUTPUTID:
        return "NFT Mint Output";
      case AVMConstants.NFTXFEROUTPUTID:
        return "NFT Transfer Output";
      case PlatformVMConstants.STAKEABLELOCKOUTID:
        return "Stakeable Lock Output";
    }
    return "";
  }
}
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
