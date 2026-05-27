<template>
  <div :active="isSelected" class="network_row">
    <div class="name_col">
      <p class="name">{{ network?.name }}</p>
      <p class="url">{{ endpoint }}</p>
      <div v-if="!isSelected && !network?.readonly" class="buts">
        <button class="editBut" @click="edit">
          <fa icon="cog"></fa>
          {{ $t("network.row.edit") }}
        </button>
        <button class="editBut" @click="deleteNet">
          <fa icon="trash"></fa>
          {{ $t("network.row.delete") }}
        </button>
      </div>
    </div>
    <div class="stat_col">
      <button v-if="!isSelected" @click="select">
        {{ $t("network.row.select") }}
      </button>
      <button v-else-if="!isConnected" class="connecting">
        {{ $t("network.status1") }}
      </button>
      <p v-else>{{ $t("network.status3") }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { AvaNetwork } from "@/js/AvaNetwork";
import type { PropType } from "vue";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useNetworkStore } from "@/stores/pinia/networks";
import { useNotificationsStore } from "@/stores/pinia/notifications";

export default defineComponent({
  props: {
    network: {
      type: Object as PropType<AvaNetwork>,
    },
  },
  emits: ["edit"],
  computed: {
    ...mapState(useNetworkStore, {
      networkStatus: "status",
      selectedNetwork: "selectedNetwork",
    }),
    endpoint() {
      const net = this.network;
      if (!net) {
        return "";
      }
      let portText = "";
      if (net.port) {
        portText = ":" + net.port;
      }

      return `${net.protocol}://${net.ip}${portText}`;
    },
    isConnected() {
      if (
        this.network === this.selectedNetwork &&
        this.networkStatus === "connected"
      ) {
        return true;
      }
      return false;
    },
    isSelected() {
      if (this.network === this.selectedNetwork) {
        return true;
      }
      return false;
    },
  },
  methods: {
    ...mapActions(useNetworkStore, {
      networkRemove: "removeCustomNetwork",
      networkSet: "setNetwork",
      networkReset: "resetNetwork",
    }),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    edit() {
      this.$emit("edit");
    },
    deleteNet() {
      if (this.network) {
        this.networkRemove(this.network);
        this.addNotification({
          title: "Network Removed",
          message: "Removed custom network.",
        });
      }
    },
    async select() {
      const net = this.network;
      if (net) {
        try {
          await this.networkSet(net);

          this.addNotification({
            title: "Network Connected",
            message: "Connected to " + net.name,
            type: "success",
          });
          // @ts-ignore
          this.$parent.$parent.isActive = false;
        } catch {
          this.networkReset();
          this.addNotification({
            title: "Connection Failed",
            message: `Failed to connect ${net.name}`,
            type: "error",
          });
        }
      }
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.stat_col {
  font-size: 14px;
  color: var(--primary-color);
  text-align: right;
  word-break: keep-all !important;
}

.network_row {
  position: relative;
  padding: 12px 0px;
  display: grid;
  grid-template-columns: 1fr 80px;
  column-gap: 15px;
  border-bottom: 1px solid var(--bg-light);

  > * {
    align-self: center;
  }
}
img {
  width: 100%;
  object-fit: contain;
}
.network_row[active] {
  .stat_col {
    color: var(--secondary-color) !important;
  }
}
.name_col {
  line-height: 1em;
  word-break: break-word;
  /*overflow: auto;*/
  /*text-overflow: ellipsis;*/
}

.buts {
  button {
    margin-right: 12px;
  }
}

.editBut {
  color: var(--primary-color);
  opacity: 0.4;
  font-size: 11px;
  /*position: absolute;*/
  /*top: 12px;*/
  /*right: 0px;*/
  margin-top: 6px;

  &:hover {
    opacity: 0.8;
  }
}

.connecting {
  animation-name: connecting;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.url,
.credentials {
  color: vars.$primary-color-light;
  font-size: 12px;
  word-break: break-all;
}

@keyframes connecting {
  from {
    color: vars.$primary-color;
  }
  to {
    color: vars.$green;
  }
}

@include mixins.mobile-device {
  img {
    display: none;
  }
  .network_row {
    grid-template-columns: 1fr max-content;
  }
}
</style>
