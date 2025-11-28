<template>
  <div class="utxo_select">
    <div class="buts">
      <button :selected="selected === 'all'" @click="select('all')">All</button>
      <button :selected="selected === 'unlocked'" @click="select('unlocked')">
        Unlocked
      </button>
      <button :selected="selected === 'locked'" @click="select('locked')">
        Locked
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import { UTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";

type Selection = "all" | "unlocked" | "locked";
export default defineComponent({
  props: {
    utxos: {
      type: Object as PropType<UTXOSet>,
    },
  },
  emits: ["change"],
  data(): {
    selected: Selection;
  } {
    return {
      selected: "all",
    };
  },
  computed: {
    selectedSet() {
      switch (this.selected) {
        case "unlocked": {
          return this.unlocked;
        }
        case "locked": {
          return this.locked;
        }
      }
      return this.utxos;
    },
    unlocked(): UTXOSet | undefined {
      const utxos = this.utxos?.getAllUTXOs();
      if (!utxos) return undefined;
      const res = new UTXOSet();
      const now = UnixNow();
      for (const utxo of utxos) {
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
    },
    locked(): UTXOSet | undefined {
      return this.unlocked ? this.utxos?.difference(this.unlocked) : undefined;
    },
  },
  methods: {
    select(type: Selection) {
      this.selected = type;
      this.$emit("change", this.selectedSet);
    },
  },
});
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
