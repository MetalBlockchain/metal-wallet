<template>
  <v-layout row wrap>
    <v-menu
      v-model="fromDateMenu"
      :close-on-content-click="false"
      offset-y
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-text-field
          hide-details
          :label="label"
          readonly
          :value="fromDateDisp"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="dateVal"
        locale="en-in"
        :max="maxDate"
        :min="minDate"
        no-title
        @input="dateIn"
      ></v-date-picker>
    </v-menu>
  </v-layout>
</template>
<script>
export const VuetifyDateInput = defineComponent({
  props: {
    label: String,
    minDate: String,
    maxDate: String,
  },
  emits: ["change"],
  data() {
    return {
      fromDateMenu: false,
      dateVal: null,

      // minDate: "2019-07-04",
      // maxDate: "2019-08-30",
    };
  },
  computed: {
    fromDateDisp() {
      return this.dateVal;
      // format date, apply validations, etc. Example below.
      // return this.fromDateVal ? this.formatDate(this.fromDateVal) : "";
    },
  },
  watch: {
    dateVal(val) {
      // console.log(val);
      this.$emit("change", val);
    },
  },
  methods: {
    dateIn() {
      this.fromDateMenu = false;
      // console.log(this.dateVal);
    },
  },
});
export default VuetifyDateInput;
</script>
<style scoped lang="scss">
.layout {
  margin: 0;
}
</style>
