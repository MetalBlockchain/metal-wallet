<template>
  <div class="node_card">
    <p class="node_id">{{ node?.nodeID }}</p>
    <!--        <div class="meta_row"></div>-->
    <div>
      <label>Fee</label>
      <p>{{ node?.fee.toFixed(2) }}%</p>
    </div>
    <div>
      <label>Uptime</label>
      <!--            <p>{{ uptimeText }}</p>-->
      <p style="font-size: 0.8rem">
        Please refer to applicable explorer to get more information about a
        node's uptime.
      </p>
    </div>
    <div>
      <label>Delegators</label>
      <p>{{ node?.numDelegators }}</p>
    </div>
    <!--        <div class="stake_row">-->
    <!--            -->
    <!--        </div>-->
    <div>
      <label>Active Stake</label>
      <p>{{ totalStakeBig.toLocaleString(0) }} METAL</p>
    </div>
    <div>
      <label>Available Stake</label>
      <p>{{ remainingStakeBig.toLocaleString(0) }} METAL</p>
    </div>
    <!--        <div class="dates"></div>-->
    <div class="date_row">
      <label>Stake Start Date</label>
      <p>{{ node?.startTime.toLocaleDateString() }}</p>
      <p>{{ node?.startTime.toLocaleTimeString() }}</p>
    </div>
    <div class="date_row">
      <label>Stake End Date</label>
      <p>
        {{ node?.endTime.toLocaleDateString() }}
      </p>
      <p>{{ node?.endTime.toLocaleTimeString() }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { AvaNetwork } from "@/js/AvaNetwork";
import type { ValidatorListItem } from "@/stores/vuex/modules/platform/types";
import Big from "big.js";
import BN from "bn.js";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";

export const NodeCard = defineComponent({
  props: {
    node: {
      type: Object as PropType<ValidatorListItem>,
    },
  },
  computed: {
    uptimeText(): string {
      return ((this.node?.uptime ?? 0) * 100).toFixed(2) + "%";
    },
    nodeStakeBig() {
      return bnToBig(this.node?.validatorStake ?? new BN(0), 9);
    },
    delegatedStakeBig() {
      return bnToBig(this.node?.delegatedStake ?? new BN(0), 9);
    },
    remainingStakeBig() {
      return bnToBig(this.node?.remainingStake ?? new BN(0), 9);
    },
    totalStakeBig() {
      if (!this.node) return new Big(0);
      return bnToBig(this.node.validatorStake.add(this.node.delegatedStake), 9);
    },
    avascanURL() {
      if (!this.node) return "";
      const activeNet: AvaNetwork = this.$store.state.Network.selectedNetwork;

      return activeNet.networkId === 1
        ? `https://avascan.info/staking/validator/${this.node.nodeID}`
        : `https://testnet.avascan.info/staking/validator/${this.node.nodeID}`;
    },
    vscoutURL() {
      if (!this.node) return "";
      return `https://vscout.io/validator/${this.node.nodeID}`;
    },
  },
});
export default NodeCard;
</script>
<style scoped lang="scss">
.node_card {
  //background-color: rgba(0, 0, 0, 0.02);
  background-color: var(--bg-light);
  border-radius: 4px;
  //width: max-content;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.2);

  > div {
    padding: 6px 14px;
    border-bottom: 1px solid var(--bg);
    &:last-of-type {
      border: none;
    }
  }
}

.node_id {
  word-break: break-all;
  //width: max-content;
  font-size: 13px;
  padding: 6px 14px;
  background-color: var(--bg-light);
  border-bottom: 2px solid var(--bg);
}

.meta_row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 14px;
}
label {
  font-size: 13px;
}
p {
  font-size: 15px;
  color: var(--primary-color-light);
}

.dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  p {
    font-size: 13px;
  }
}

.stake_row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
}
.date_row {
  label {
    display: block;
  }
  p {
    display: inline-block;

    &:first-of-type {
      margin-right: 24px !important;
    }
  }
}
</style>
