<template>
  <div class="dates_form">
    <!--        <div>-->
    <!--            <label>{{ $t('earn.validate.duration.start') }}</label>-->
    <!--            <datetime-->
    <!--                v-model="localStart"-->
    <!--                type="datetime"-->
    <!--                class="date hover_border"-->
    <!--                :min-datetime="startDateMin"-->
    <!--                :max-datetime="startDateMax"-->
    <!--            ></datetime>-->
    <!--        </div>-->
    <div class="hover_border">
      <button class="max_but" @click="maxoutEndDate">Max</button>
      <DateTimePicker
        v-model="localEnd"
        class="date"
        :max-datetime="endDateMax"
        :min-datetime="endDateMin"
      ></DateTimePicker>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DAY_MS, MINUTE_MS } from "@/constants";

const MIN_STAKE_DURATION = DAY_MS * 14;

export default defineComponent({
  props: {
    maxEndDate: {
      type: String,
    },
  },
  emits: ["change-end"],
  data(): {
    localStart: string;
    localEnd: string;
  } {
    const now = Date.now();
    const res = now + MINUTE_MS * 15;
    const startDate = new Date(res);
    const end = startDate.getTime() + DAY_MS * 21;

    return {
      localStart: startDate.toISOString(),
      localEnd: new Date(end).toISOString(),
    };
  },
  computed: {
    stakeDuration(): number {
      const start = new Date(this.localStart);
      const end = new Date(this.localEnd);
      const diff = end.getTime() - start.getTime();
      return diff;
    },
    endDateMin() {
      const start = this.localStart;
      const startDate = new Date(start);

      const end = startDate.getTime() + MIN_STAKE_DURATION;
      const endDate = new Date(end);
      return endDate.toISOString();
    },
    endDateMax() {
      if (this.maxEndDate) return this.maxEndDate;

      const start = this.localStart;
      const startDate = new Date(start);

      const end = startDate.getTime() + DAY_MS * 365;
      const endDate = new Date(end);
      return endDate.toISOString();
    },
  },
  watch: {
    localEnd: [
      {
        handler: "endChange",
        immediate: true
      },
    ],
  },
  methods: {
    setEndDate(val: string) {
      this.$emit("change-end", val);
    },
    maxoutEndDate() {
      this.localEnd = this.endDateMax;
    },
    endChange(val: string) {
      this.setEndDate(val);

      const endTime = new Date(val).getTime();
      const minDateTime = new Date(this.endDateMin).getTime();

      if (endTime < minDateTime) {
        this.localEnd = this.endDateMin;
      }
    },
  },
});
</script>
<style lang="scss">
.dates_form {
  .date input {
    border: none !important;
    text-align: right;
    width: 100%;
  }
}
</style>
<style scoped lang="scss">
.dates_form {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 15px;
  width: 100%;

  > div {
    width: 100%;
    display: grid;
    grid-template-columns: max-content 1fr;
    background-color: var(--bg-light);
  }

  label > span {
    float: right;
    opacity: 0.4;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
}

.max_but {
  padding-left: 12px;
  color: var(--primary-color-light);
  &:hover {
    color: var(--primary-color);
  }
}
</style>
