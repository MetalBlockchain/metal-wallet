<template>
  <div class="search_address">
    <template v-if="modelValue">
      <p class="selected no_overflow_addr" @click="clearSelection">
        {{ modelValue }}
      </p>
    </template>
    <template v-else>
      <input
        v-model="address"
        class="hover_border"
        placeholder="Search address.."
        type="text"
        @input="onInput"
      />
      <div v-if="matchingAddrs.length > 0" class="search_results">
        <p
          v-for="addr in matchingAddrs"
          :key="addr"
          class="no_overflow_addr"
          @click="selectAddress(addr)"
        >
          {{ addr }}
        </p>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import type { WalletType } from "@/js/wallets/types";
import type { PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    wallet: {
      type: Object as PropType<WalletType>,
    },
    modelValue: { type: String },
  },
  emits: ["update:modelValue"],
  data() {
    const matchingAddrs: string[] = [];

    return {
      address: "",
      matchingAddrs,
    };
  },
  computed: {
    addrsX(): string[] {
      return this.wallet?.getAllDerivedExternalAddresses() ?? [];
    },
    addrsP(): string[] {
      return this.wallet?.getAllAddressesP() ?? [];
    },
  },
  methods: {
    emitChange(val: string | null) {
      this.$emit("update:modelValue", val);
    },
    clearSelection() {
      this.address = "";
      this.matchingAddrs = [];

      this.emitChange(null);
    },
    selectAddress(addr: string) {
      this.emitChange(addr);
    },
    onInput() {
      if (this.address === "") {
        this.matchingAddrs = [];
        return;
      }

      const pAddrs = this.addrsP.filter((addr) => {
        return addr.includes(this.address);
      });
      const xAddrs = this.addrsX.filter((addr) => {
        return addr.includes(this.address);
      });

      this.matchingAddrs = [...pAddrs.slice(0, 2), ...xAddrs.slice(0, 2)];
    },
  },
});
</script>
<style scoped lang="scss">
$addrSize: 14px;

.search_address {
  position: relative;
}

.no_overflow_addr {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 2px 6px;
  cursor: pointer;
  font-size: $addrSize;
  font-family: monospace;
}

input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  font-size: $addrSize;
  color: var(--primary-color);
}
.search_results {
  position: absolute;
  top: calc(100% - 1px);
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
  border: 1px solid var(--bg);
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  border-top: 0;

  p {
    cursor: pointer;
    &:hover {
      color: var(--secondary-color);
    }
  }
}

.selected {
  background-color: var(--secondary-color);
  color: #fff;
  border-radius: 4px;
}
</style>
