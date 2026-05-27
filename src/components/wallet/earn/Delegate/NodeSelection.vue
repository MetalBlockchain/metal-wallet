<template>
  <div class="node_selection">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div style="display: flex; align-items: center">
        <p>{{ $t("earn.delegate.list.prompt") }}:</p>
        <input
          v-model="search"
          class="search"
          :placeholder="$t('earn.delegate.list.search').toString()"
          type="text"
        />
      </div>

      <div class="rigt_but">
        <button @click="openFilters">
          {{ $t("earn.delegate.filter.title") }}
          <fa icon="filter"></fa>
        </button>
      </div>
    </div>
    <ValidatorsList
      ref="val_list"
      class="val_list"
      :search="search"
      @select="onselect"
    ></ValidatorsList>
  </div>
</template>
<script lang="ts">
import type { ValidatorListItem } from "@/stores/vuex/modules/platform/types";
import { defineComponent } from "vue";
import ValidatorsList from "@/components/misc/ValidatorList/ValidatorsList.vue";

export const NodeSelection = defineComponent({
  components: {
    ValidatorsList,
  },
  emits: ["select"],
  data() {
    return {
      search: "",
    };
  },
  methods: {
    openFilters() {
      //@ts-ignore
      this.$refs.val_list.openFilters();
    },
    onselect(val: ValidatorListItem) {
      this.$emit("select", val);
    },
  },
});
export default NodeSelection;
</script>
<style scoped lang="scss">
.node_selection {
  display: grid;
  overflow: auto;
  row-gap: 14px;
  grid-template-rows: max-content 1fr;
}

.val_list {
  overflow: auto;
  height: 100%;
  /*margin-top: 14px;*/
}

.search {
  padding: 3px 12px;
  border-radius: 12px;
  background-color: var(--bg-light);
  margin-left: 30px;
  color: var(--primary-color);
}

.rigt_but {
  float: right;

  button {
    color: var(--primary-color-light);

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
