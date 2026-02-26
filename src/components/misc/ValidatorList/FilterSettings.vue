<template>
  <div class="filter_settings">
    <div class="modal_body">
      <h3>{{ $t("earn.delegate.filter.title2") }}</h3>
      <div class="inputs">
        <div class="uptime">
          <label>{{ $t("earn.delegate.filter.label1") }}</label>
          <div class="input_row hover_border">
            <input
              v-model="availableSpace"
              inputmode="numeric"
              min="0"
              step="1"
              type="number"
              @input="onInputChange"
            />
            <p>METAL</p>
          </div>
        </div>
        <div class="duration">
          <label>{{ $t("earn.delegate.filter.label2") }}</label>
          <div class="input_row slider_row">
            <input
              v-model="minDuration"
              max="365"
              min="14"
              step="1"
              type="range"
              @input="onInputChange"
            />
            <p style="display: inline-block">{{ durationText }}</p>
          </div>
        </div>
        <div class="fee">
          <label>{{ $t("earn.delegate.filter.label3") }}</label>
          <div class="input_row hover_border">
            <input
              v-model="maxFee"
              inputmode="numeric"
              max="100"
              min="0"
              step="1"
              type="number"
              @input="onInputChange"
            />
            <p>%</p>
          </div>
        </div>
        <div class="uptime">
          <label>{{ $t("earn.delegate.filter.label4") }}</label>
          <div class="input_row hover_border">
            <input
              v-model="minUptime"
              inputmode="numeric"
              max="100"
              min="0"
              step="1"
              type="number"
              @input="onInputChange"
            />
            <p>%</p>
          </div>
        </div>
      </div>

      <div class="preview">
        <p>{{ $t("earn.delegate.filter.preview", [count]) }}</p>
      </div>

      <div class="checkout">
        <v-btn
          class="button_secondary"
          depressed
          :disabled="!canApply"
          small
          @click="apply"
        >
          {{ $t("earn.delegate.filter.apply") }}
        </v-btn>
        <v-btn
          v-if="activeFilter"
          block
          class="button_primary"
          small
          style="margin: 8px 0px"
          text
          @click="clear"
        >
          {{ $t("earn.delegate.filter.clear") }}
        </v-btn>
        <button class="button_form_cancel" @click="close">
          {{ $t("earn.delegate.filter.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { ValidatorListFilter } from "@/components/wallet/earn/Delegate/types";
import type { ValidatorListItem } from "@/stores/types/platform";
import moment from "moment";
import { defineComponent } from "vue";
import { filterValidatorList } from "@/components/wallet/earn/Delegate/helper";

const MINUTE_MS = 60_000;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

export const FilterSettings = defineComponent({
  props: {
    validators: {
      type: Array as PropType<ValidatorListItem[]>,
    },
  },
  emits: ["close", "change"],
  data(): {
    minDuration: number;
    maxFee: number;
    minUptime: number;
    availableSpace: number;
    activeFilter: null | ValidatorListFilter;
    count: number;
    timeout: ReturnType<typeof setTimeout> | null;
  } {
    const timeout: ReturnType<typeof setTimeout> | null = null;
    const activeFilter: null | ValidatorListFilter = null;

    return {
      minDuration: 14,
      maxFee: 10,
      minUptime: 90,
      availableSpace: 25,
      activeFilter,
      count: 0,
      timeout,
    };
  },
  computed: {
    durationText() {
      const duration = moment.duration(
        this.minDuration * DAY_MS,
        "milliseconds",
      );

      return `${duration.months()} months ${duration.days()} days`;
    },
    canApply() {
      if (this.count === 0) return false;
      return true;
    },
  },
  watch: {
    validators: [
      {
        handler: "onValidatorsChange",
      },
    ],
  },
  methods: {
    checkValues() {
      // max fee
      if (this.maxFee > 100) this.maxFee = 100;
      if (this.maxFee < 0) this.maxFee = 0;

      // uptime
      if (this.minUptime > 100) this.minUptime = 100;
      if (this.minUptime < 0) this.minUptime = 0;
    },
    onInputChange() {
      this.checkValues();
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      const timeout = setTimeout(() => {
        this.updateCount();
      }, 700);
      this.timeout = timeout;
    },
    updateCount() {
      const validators = this.validators;
      const filter = this.createFilter();
      const res = filterValidatorList(validators ?? [], filter);
      this.count = res.length;
    },
    close() {
      this.$emit("close");
    },
    createFilter(): ValidatorListFilter {
      return {
        minDuration: this.minDuration,
        maxFee: this.maxFee,
        minUptime: this.minUptime,
        availableSpace: this.availableSpace,
      };
    },
    clear() {
      this.activeFilter = null;
      this.$emit("change", null);
      this.close();
    },
    apply() {
      const filter: ValidatorListFilter = this.createFilter();
      this.activeFilter = filter;
      this.$emit("change", filter);
      this.close();
    },
    onValidatorsChange() {
      this.updateCount();
    },
  },
});
export default FilterSettings;
</script>
<style scoped lang="scss">
.filter_settings {
  background-color: rgba(var(--bg-1), 0.9);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.modal_body {
  width: 100%;
  max-width: 360px;
  background-color: var(--bg-light);
  padding: 14px 30px;
  border: 1px solid #0004;
}

.inputs {
  > div {
    margin: 4px 0;
    color: var(--primary-color-light);
  }

  input {
    border: none !important;
    outline: none !important;
    color: var(--primary-color);
    padding-right: 8px;
  }
}

.input_row {
  display: grid;
  grid-template-columns: 1fr max-content;
  background-color: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 4px 12px;
  border-radius: 2px;
  margin-bottom: 4px;
  font-size: 14px;
}

.slider_row {
  display: flex;
  flex-direction: column;
  text-align: right;
  border: none;
  background-color: transparent;
  padding: 2px 0;

  input {
    margin: 4px 0;
  }
  p {
    margin: 0 !important;
  }
}
label {
  display: block;
  text-align: left;
  color: var(--primary-color-light);
  font-size: 12px;
  margin-bottom: 20px;
}

.duration {
  p {
    color: var(--primary-color-light);
  }
}

.fee,
.uptime {
  input {
    text-align: right;
  }
}

.preview {
  margin: 12px 0;
  font-size: 12px;
}

.checkout {
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}
</style>
