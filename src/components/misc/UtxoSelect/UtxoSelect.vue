<template>
  <div class="utxo_select">
    <div class="buts">
      <button @click="select('all')" :selected="selected === 'all'">All</button>
      <button @click="select('unlocked')" :selected="selected === 'unlocked'">
        Unlocked
      </button>
      <button @click="select('locked')" :selected="selected === 'locked'">
        Locked
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { UTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
type Selection = "all" | "unlocked" | "locked";
@Component
export default class UTXOSelect extends Vue {
  @Prop() utxos!: UTXOSet;
  selected: Selection = "all";
  select(type: Selection) {
    this.selected = type;
    this.$emit("change", this.selectedSet);
  }
  get selectedSet() {
    switch (this.selected) {
      case "all":
        return this.utxos;
      case "unlocked":
        return this.unlocked;
      case "locked":
        return this.locked;
    }
    return this.utxos;
  }
  get unlocked(): UTXOSet {
    const utxos = this.utxos.getAllUTXOs();
    const res = new UTXOSet();
    const now = UnixNow();
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      const out = utxo.getOutput();
      const type = out.getOutputID();
      if (type !== 22) {
        const locktime = out.getLocktime();
        if (locktime.lt(now)) {
          res.add(utxo);
        }
      }
    }
    return res;
  }
  get locked(): UTXOSet {
    return this.utxos.difference(this.unlocked);
  }
}
</script>
<style scoped lang="scss">
.utxo_select {
  display: flex;
  margin: 4px 0;
  button {
    font-size: 13px;
    padding: 4px 8px;
    background-color: var(--bg-light);
    &[selected] {
      background-color: var(--primary-color);
      color: var(--bg);
    }
  }
}
.buts {
  border-radius: 4px;
  overflow: hidden;
}
</style>
