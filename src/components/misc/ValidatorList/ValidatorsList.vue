<template>
  <div class="validator_list">
    <FilterSettings
      v-show="showFilter"
      class="filter_modal"
      :validators="validators"
      @change="applyFilter"
      @close="showFilter = false"
    ></FilterSettings>
    <div class="table_cont">
      <table>
        <thead>
          <tr class="header_tr">
            <th>{{ $t("earn.delegate.list.id") }}</th>
            <th style="text-align: right">
              {{ $t("earn.delegate.list.val_stake") }}
            </th>
            <th style="text-align: right">
              {{ $t("earn.delegate.list.aval_stake") }}
              <Tooltip
                style="display: inline-block"
                :text="$t('earn.delegate.list.aval_stake_tip')"
              >
                <fa icon="question-circle"></fa>
              </Tooltip>
            </th>
            <th>
              <Tooltip text="Number of Delegators"
                ><fa icon="users"></fa
              ></Tooltip>
            </th>
            <th>{{ $t("earn.delegate.list.end") }}</th>
            <th>{{ $t("earn.delegate.list.fee") }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <ValidatorRow
            v-for="v in validatorsFiltered"
            :key="v.nodeID"
            :validator="v"
            @select="onselect"
          ></ValidatorRow>
        </tbody>
      </table>
    </div>
    <div v-if="validators.length === 0" class="empty_list">
      <h4>{{ $t("earn.delegate.list.empty.title") }}</h4>
      <p>{{ $t("earn.delegate.list.empty.desc") }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import type { ValidatorListFilter } from "@/components/wallet/earn/Delegate/types";
import type { ValidatorMetaData } from "@/stores/types";

import type { ValidatorListItem } from "@/stores/types/platform";

import { defineComponent } from "vue";
import Tooltip from "@/components/misc/Tooltip.vue";
import FilterSettings from "@/components/misc/ValidatorList/FilterSettings.vue";
import ValidatorRow from "@/components/misc/ValidatorList/ValidatorRow.vue";
import { filterValidatorList } from "@/components/wallet/earn/Delegate/helper";

export const ValidatorsList = defineComponent({
  components: { Tooltip, ValidatorRow, FilterSettings },
  props: {
    search: {
      type: String,
    },
  },
  emits: ["select"],
  data(): {
    filter: ValidatorListFilter | null;
    showFilter: boolean;
  } {
    return {
      showFilter: false,
      filter: null,
    };
  },
  computed: {
    validators(): ValidatorListItem[] {
      let list: ValidatorListItem[] =
        this.$store.getters["Platform/validatorListEarn"];
      const metaData: ValidatorMetaData =
        this.$store.getters["validatorMetaData"];

      if (metaData && metaData.validators) {
        for (const validator of list) {
          const data = metaData.validators.find(
            (s: any) => s.id === validator.nodeID,
          );

          if (data) {
            validator.name = data.name;
            validator.country = data.country;
          }
        }
      }

      const search = this.search;
      if (search) {
        list = list.filter((v) => {
          return v.nodeID.includes(search);
        });
      }

      // order by stake amount
      // eslint-disable-next-line unicorn/no-array-sort
      list = list.sort((a, b) => {
        console.log(a);
        const amtA = a.fee;
        const amtB = b.fee;

        if (amtA > amtB) {
          return 1;
        } else if (amtA < amtB) {
          return -1;
        } else {
          return 0;
        }
      });

      return list;
    },
    validatorsFiltered(): ValidatorListItem[] {
      return filterValidatorList(this.validators, this.filter);
    },
  },
  methods: {
    openFilters() {
      this.showFilter = true;
    },
    hideFilters() {
      this.showFilter = false;
    },
    applyFilter(filter: ValidatorListFilter | null) {
      this.filter = filter;
    },
    onselect(val: ValidatorListItem) {
      this.$emit("select", val);
    },
  },
});
export default ValidatorsList;
</script>
<style scoped lang="scss">
.validator_list {
  position: relative;
  width: 100%;
}

.table_cont {
  overflow: scroll;
  max-height: 450px;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th {
  position: sticky;
  top: 0;
  padding: 2px 14px;
  font-size: 14px;
  background-color: var(--bg-wallet-light);
}

.empty_list {
  padding: 30px;
  text-align: center;
}

.filter_modal {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>
