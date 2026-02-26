<template>
  <div class="content">
    <template v-if="isLoading">
      <Spinner class="_spin" style="width: 40px"></Spinner>
      <p>Loading Wallet</p>
    </template>
    <div v-if="!isLoading" class="wallet_body">
      <Balances
        :balances="balances"
        class="balances section"
        :stake-amt="stakeAmt"
      ></Balances>
      <div class="">
        <v-btn
          class="button_secondary"
          depressed
          disabled
          :loading="isStakeDownloading"
          small
          @click="downloadRewardsHistory"
        >
          Download Staking History
        </v-btn>
      </div>
      <v-btn depressed small style="margin-top: 1em" @click="logout"
        >Logout</v-btn
      >
    </div>
  </div>
</template>
<script lang="ts">
import type {
  HistoryItemType,
  iAvaxBalance,
  PublicMnemonicWallet,
} from "@metalblockchain/metal-wallet-sdk";
import type { UTXOSet as AVMUTXOSet } from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  UTXOSet as PlatformUTXOSet,
  TransferableOutput,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { Network } from "@metalblockchain/metaljs/dist/utils";
import {
  BN,
  createCsvNormal,
  createCsvStaking,
  ethersProvider,
  getTransactionSummary,
  isHistoryStakingTx,
} from "@metalblockchain/metal-wallet-sdk";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import { getPriceAtUnixTime } from "@/helpers/price_helper";
import { downloadCSVFile } from "@/stores/utils/history_utils";
import Balances from "@/views/wallet_readonly/Balances.vue";

// import {ethers} from "ethers";
export const WalletReadonly = defineComponent({
  components: { Spinner, Balances },
  data(): {
    isWalletLoading: boolean;
    isBalanceLoading: boolean;
    isStakeDownloading: boolean;
    balances: iAvaxBalance | null;
    stakeAmt: BN | null;
    addressX: string;
    addressP: string;
    addressC: string;
    utxosX: null | AVMUTXOSet;
    utxosP: null | PlatformUTXOSet;
    stakeOuts: null | TransferableOutput[];
  } {
    const stakeOuts: null | TransferableOutput[] = null;
    const utxosP: null | PlatformUTXOSet = null;
    const utxosX: null | AVMUTXOSet = null;
    const stakeAmt: BN | null = null;
    const balances: iAvaxBalance | null = null;

    return {
      isWalletLoading: true,
      isBalanceLoading: false,
      isStakeDownloading: false,
      balances,
      stakeAmt,
      addressX: "",
      addressP: "",
      addressC: "",
      utxosX,
      utxosP,
      stakeOuts,
    };
  },
  computed: {
    wallet(): PublicMnemonicWallet {
      //@ts-ignore
      return this.$route.params.wallet;
    },
    evmAddress(): string {
      //@ts-ignore
      return this.$route.params.evmAddress;
    },
    isLoading() {
      return this.isWalletLoading || this.isBalanceLoading;
    },
    network(): Network | null {
      return this.$store.state.Network.selectedNetwork;
    },
  },
  watch: {
    network: [
      {
        handler: "onNetworkChange",
      },
    ],
  },
  created() {
    if (!this.wallet) {
      this.logout();
    }
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.wallet.destroy();
  },
  methods: {
    updateAddresses() {
      this.addressX = this.wallet.getAddressX();
      this.addressP = this.wallet.getAddressP();
      this.addressC = this.wallet.getAddressC();
    },
    async updateBalance() {
      this.isBalanceLoading = true;
      this.utxosX = await this.wallet.updateUtxosX();
      this.utxosP = await this.wallet.updateUtxosP();
      await this.wallet.updateAvaxBalanceC();

      const avaxBalance = this.wallet.getAvaxBalance();
      this.balances = avaxBalance;

      const cBal = await ethersProvider
        .getSigner(this.evmAddress)
        .getBalance("latest");
      avaxBalance.C = new BN(cBal.toString());

      const { staked, stakedOutputs } = await this.wallet.getStake();
      this.stakeAmt = staked;
      this.stakeOuts = stakedOutputs;
      this.isBalanceLoading = false;
    },
    async downloadAvaxHistory() {
      const hist = await this.wallet.getHistory();
      const csvContent = createCsvNormal(hist);
      const encoding = "data:text/csv;charset=utf-8,";
      downloadCSVFile(encoding + csvContent, "avax_transfers");
    },
    async downloadRewardsHistory() {
      try {
        this.isStakeDownloading = true;
        // const hist = await this.wallet.getHistory()
        const hist = await this.wallet.getHistoryP();
        let parsed: HistoryItemType[] = [];

        for (const tx of hist) {
          try {
            const summary = await getTransactionSummary(
              tx,
              this.wallet.getAllAddressesPSync(),
              this.evmAddress,
            );
            parsed.push(summary);
          } catch (error) {
            console.log("Error parsing transaction:", tx.id);
            console.log(error);
          }
        }

        parsed = parsed.map((item) => {
          if (isHistoryStakingTx(item)) {
            const unixTime = item.stakeEnd.getTime();
            const price = getPriceAtUnixTime(unixTime);
            return {
              ...item,
              avaxPrice: price,
            };
          } else {
            return item;
          }
        });

        const csvContent = createCsvStaking(parsed);
        const encoding = "data:text/csv;charset=utf-8,";
        const fileName = `avax_staking_txs_${new Date().toLocaleDateString()}`;
        downloadCSVFile(encoding + csvContent, fileName);
      } catch (error) {
        this.isStakeDownloading = false;
        this.$store.dispatch("Notifications/add", {
          type: "error",
          title: "Request Failed",
          message: "Failed to download rewards history.",
        });
        console.log(error);
      }
      this.isStakeDownloading = false;
    },
    logout() {
      this.$router.push("/access");
    },
    init() {
      this.isWalletLoading = true;
      this.wallet.resetHdIndices().then(() => {
        this.updateAddresses();
        this.isWalletLoading = false;
        this.updateBalance();
      });
    },
    onNetworkChange() {
      this.init();
    },
  },
});
export default WalletReadonly;
</script>
<style scoped lang="scss">
.wallet_body {
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.section {
  border: 1px solid var(--primary-color-light);
  border-radius: 1em;
  padding: 1em;
  margin-bottom: 1em;
}

._spin {
  width: 40px;
  height: 40px;
  font-size: 25px;
}
</style>
