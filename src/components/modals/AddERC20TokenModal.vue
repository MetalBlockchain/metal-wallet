<template>
  <modal ref="modal" title="Add Token" @before-close="beforeClose">
    <div class="add_token_body">
      <div>
        <label>Token Contract Address</label>
        <input v-model="tokenAddress" placeholder="0x" />
        <p class="err">{{ err }}</p>
      </div>

      <div class="meta" :found="canAdd">
        <div>
          <label>Token Name</label>
          <input v-model="name" disabled />
        </div>
        <div>
          <label>Token Symbol</label>
          <input v-model="symbol" disabled />
        </div>
        <div>
          <label>Decimals of Precision</label>
          <input v-model="denomination" disabled type="number" />
        </div>
      </div>

      <v-btn
        block
        class="button_secondary"
        depressed
        :disabled="!canAdd"
        @click="submit"
      >
        Add Token
      </v-btn>
    </div>
  </modal>
</template>

<script lang="ts">
import type { TokenListToken } from "@/stores/types/assets";
import ERC20Abi from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { web3 } from "@/misc/evm";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import Modal from "./Modal.vue";

export const AddERC20TokenModal = defineComponent({
  components: {
    Modal,
  },
  data() {
    return {
      tokenAddress: "",
      name: "",
      symbol: "",
      denomination: 1,
      canAdd: false,
      err: "",
    };
  },
  computed: {
    ...mapState(useAssetsStore, ["evmChainId"]),
  },
  watch: {
    tokenAddress: [
      {
        handler: "onAddressChange",
      },
    ],
  },
  methods: {
    ...mapActions(useAssetsStore, ["addCustomErc20Token"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    async validateAddress(val: string) {
      if (val === "") {
        this.err = "";
        return false;
      }
      try {
        const tokenInst = new web3.eth.Contract(ERC20Abi.abi as any, val);
        const name = await tokenInst.methods.name().call();
        const symbol = await tokenInst.methods.symbol().call();
        const decimals = await tokenInst.methods.decimals().call();

        this.symbol = symbol;
        this.denomination = decimals;
        this.name = name;

        this.canAdd = true;
        return true;
      } catch {
        this.canAdd = false;
        this.symbol = "-";
        this.denomination = 0;
        this.name = "-";
        this.err = "Invalid contract address.";
        return false;
      }
    },
    clear() {
      this.tokenAddress = "";
      this.canAdd = false;
      this.symbol = "-";
      this.denomination = 0;
      this.name = "-";
      this.err = "";
    },
    async submit() {
      try {
        const data: TokenListToken = {
          address: this.tokenAddress,
          name: this.name,
          symbol: this.symbol,
          decimals: this.denomination,
          chainId: this.evmChainId,
          logoURI: "",
        };

        const token = this.addCustomErc20Token(data);
        if (token) {
          this.addNotification({
            title: "ERC20 Token Added",
            message: token.data.name,
          });
        }
        this.close();
      } catch (error: any) {
        this.err = error.message;
        console.error(error);
      }
    },
    beforeClose() {
      this.clear();
    },
    open() {
      (this.$refs.modal as any).open();
    },
    close() {
      (this.$refs.modal as any).close();
    },
    async onAddressChange(val: string) {
      this.err = "";
      if (val === "") {
        this.clear();
        return;
      }
      await this.validateAddress(val);
    },
  },
});
export default AddERC20TokenModal;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.add_token_body {
  padding: 30px 22px;
  text-align: center;
  width: 380px;
  max-width: 100%;

  > div {
    &:first-of-type {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--bg-light);
    }
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  label {
    font-size: 13px;
  }
  input {
    width: 100%;
    background-color: var(--bg-light);
    padding: 14px 24px;
    border-radius: 3px;
    font-size: 14px;
    color: var(--primary-color);
  }
}

.meta {
  text-align: left;
  background-color: var(--bg-light);
  opacity: 0.6;
  transition-duration: 0.3s;

  > div {
    border-bottom: 1px solid var(--bg);
    padding: 14px 24px;
  }

  label {
    color: var(--primary-color-light);
  }
  input {
    padding: 0;
    color: var(--primary-color);
  }
}

.meta[found] {
  opacity: 1;
}

.err {
  width: 100%;
  text-align: center;
}

@include mixins.mobile-device {
  .add_token_body {
    width: 100%;
  }
}
</style>
