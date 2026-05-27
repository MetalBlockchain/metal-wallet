<template>
  <v-dialog v-model="display" :width="dialogWidth">
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind="activatorProps"
        hide-details="auto"
        :label="label"
        readonly
        :value="formattedDatetime"
      >
      </v-text-field>
    </template>

    <v-card>
      <v-card-text class="px-0 py-0">
        <v-tabs v-model="activeTab" fixed-tabs>
          <v-tab value="calendar"> <fa icon="calendar"></fa></v-tab>
          <v-tab value="timer"> <fa icon="clock"></fa></v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <v-tabs-window-item value="calendar">
            <v-date-picker
              v-model="date"
              v-bind="datePickerProps"
              full-width
              :max="maxDatetime"
              :min="minDatetime"
              @update:model-value="showTimePicker"
            ></v-date-picker>
          </v-tabs-window-item>
          <v-tabs-window-item value="timer">
            <v-time-picker
              ref="timer"
              v-model="time"
              class="v-time-picker-custom"
              v-bind="timePickerProps"
              full-width
            ></v-time-picker>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="actions" :parent="this">
          <v-btn color="grey lighten-1" text @click="clearHandler">
            {{ clearText }}
          </v-btn>
          <v-btn color="green darken-1" text @click="okHandler">
            {{ okText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { VTimePicker } from "vuetify/components";
import { format, parse, parseISO } from "date-fns";

const DEFAULT_DATE = "";
const DEFAULT_TIME = "00:00:00";
const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
const DEFAULT_TIME_FORMAT = "HH:mm:ss";
const DEFAULT_DIALOG_WIDTH = 340;
const DEFAULT_CLEAR_TEXT = "CLEAR";
const DEFAULT_OK_TEXT = "OK";

export const DateTimePicker = defineComponent({
  props: {
    modelValue: {
      type: [Date, String],
      default: null,
    },
    disabled: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
    label: {
      type: String,
      default: "",
    },
    minDatetime: {
      type: [Date, String],
    },
    maxDatetime: {
      type: [Date, String],
    },
    dialogWidth: {
      type: Number,
      default: DEFAULT_DIALOG_WIDTH,
    },
    dateFormat: {
      type: String,
      default: DEFAULT_DATE_FORMAT,
    },
    timeFormat: {
      type: String,
      default: "HH:mm",
    },
    clearText: {
      type: String,
      default: DEFAULT_CLEAR_TEXT,
    },
    okText: {
      type: String,
      default: DEFAULT_OK_TEXT,
    },
    textFieldProps: {
      type: Object,
    },
    datePickerProps: {
      type: Object,
    },
    timePickerProps: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      display: false,
      activeTab: "calendar",
      date: DEFAULT_DATE,
      time: DEFAULT_TIME,
    };
  },
  computed: {
    dateTimeFormat() {
      return this.dateFormat + " " + this.timeFormat;
    },
    defaultDateTimeFormat() {
      return DEFAULT_DATE_FORMAT + " " + DEFAULT_TIME_FORMAT;
    },
    formattedDatetime() {
      return this.selectedDatetime
        ? format(this.selectedDatetime, this.dateTimeFormat)
        : "";
    },
    selectedDatetime() {
      if (this.date && this.time) {
        let time = this.time;
        const date =
          typeof this.date === "string"
            ? this.date
            : format(this.date, DEFAULT_DATE_FORMAT);
        if (time.length === 5) {
          time += ":00";
        }

        const datetimeString = date + " " + time;
        return parse(datetimeString, this.defaultDateTimeFormat, new Date());
      } else {
        return null;
      }
    },
    dateSelected() {
      return !this.date;
    },
  },
  watch: {
    modelValue() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (!this.modelValue) {
        return;
      }
      const initDateTime = this.parseDate(this.modelValue);
      this.date = format(initDateTime, DEFAULT_DATE_FORMAT);
      this.time = format(initDateTime, DEFAULT_TIME_FORMAT);
    },
    parseDate(val: string | Date) {
      if (typeof val === "string") {
        return val.includes("T")
          ? parseISO(val)
          : parse(val, this.dateTimeFormat, new Date());
      }
      return val;
    },
    okHandler() {
      this.resetPicker();
      this.$emit("update:modelValue", this.selectedDatetime);
    },
    clearHandler() {
      this.resetPicker();
      this.date = DEFAULT_DATE;
      this.time = DEFAULT_TIME;
      this.$emit("update:modelValue", null);
    },
    resetPicker() {
      this.display = false;
      this.activeTab = "calendar";
      if (this.$refs.timer) {
        (this.$refs.timer as typeof VTimePicker).selectingHour = true;
      }
    },
    showTimePicker() {
      this.activeTab = "timer";
    },
  },
});
export default DateTimePicker;
</script>
