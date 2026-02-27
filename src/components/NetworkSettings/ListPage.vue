<template>
  <div>
    <div class="networks_list">
      <network-row
        v-for="net in networks"
        :key="net.id"
        class="network_row"
        data-cy="network-item"
        :network="net"
        @edit="onEdit(net)"
      ></network-row>
    </div>
  </div>
</template>
<script lang="ts">
import type { AvaNetwork } from "@/js/AvaNetwork";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { useNetworkStore } from "@/stores/pinia/networks";
import NetworkRow from "./NetworkRow.vue";

export const ListPage = defineComponent({
  components: {
    NetworkRow,
  },
  emits: ["edit"],
  computed: {
    ...mapState(useNetworkStore, {
      networks: "allNetworks",
    }),
  },
  methods: {
    onEdit(net: AvaNetwork) {
      this.$emit("edit", net);
    },
  },
});
export default ListPage;
</script>
<style scoped lang="scss">
.networks_list {
  padding: 0px 15px;
}
</style>
