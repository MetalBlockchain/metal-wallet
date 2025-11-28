<template>
  <div class="address_dropdown">
    <div class="display" @click="toggle">
      <p v-if="!value" class="placeholder">Select Address</p>
      <div v-if="multiple" class="display_val">
        <p class="chip">{{ value[0] }}</p>
        <p v-if="value.length > 1">and {{ value.length - 1 }} others.</p>
      </div>
      <div v-else class="display_val">
        <p class="chip">{{ value }}</p>
      </div>
      <p class="caret"><fa icon="caret-down"></fa></p>
    </div>
    <div
      v-show="active"
      ref="popup_list"
      class="list"
      tabindex="1"
      @blur="blur"
      @focus="focus"
    >
      <!--            <v-select></v-select>-->
      <ul>
        <li v-if="multiple" class="select_all" @click="toggleAll">
          <input :checked="isAll" type="checkbox" />
          <p class="add_title">All Addresses</p>
        </li>
        <!--                <list-item v-for="(item, index) in items" :key="item" :value="item" :index="index"></list-item>-->
        <li
          v-for="(item, index) in items"
          :key="item"
          @click="toggleItem(item, index)"
        >
          <input :checked="value.includes(item)" type="checkbox" />
          <div>
            <p class="add_title">Address {{ index }}</p>
            <p class="add_val">{{ item }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
export const AddressDropdown = defineComponent({
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    defaultVal: {
      type: [Array, String],
    },
  },
  emits: ["change"],
  data() {
    return {
      active: false,
      isAll: false,
      value: [],
    };
  },
  computed: {
    items() {
      return this.$store.state.addresses;
    },
  },
  mounted() {
    if (this.default_val) {
      // console.log(this.default_val);
      if (Array.isArray(this.default_val)) {
        this.value = this.multiple
          ? this.default_val.slice()
          : this.default_val[0];
      } else {
        this.value = this.default_val;
      }

      this.emit();
    }
  },
  methods: {
    blur() {
      this.active = false;
    },

    focus() {},

    toggle() {
      this.active = !this.active;
      this.$nextTick(() => {
        if (this.active) {
          this.$refs["popup_list"].focus();
        }
      });
    },

    toggleItem(val) {
      if (this.value.includes(val)) {
        if (this.multiple) {
          const index = this.value.indexOf(val);
          this.value.splice(index, 1);
        }
      } else {
        if (this.multiple) {
          this.value.push(val);
        } else {
          this.value = val;
        }
      }

      this.isAll = this.value.length === this.items.length ? true : false;
      this.emit();
    },

    toggleAll() {
      this.value = this.isAll ? [] : this.items.slice();
      this.isAll = !this.isAll;
      this.emit();
    },

    emit() {
      this.$emit("change", this.value);
    },
  },
});
export default AddressDropdown;
</script>

<style scoped>
.address_dropdown {
  position: relative;
  border: 1px solid #fafafa;
  cursor: pointer;
}

.placeholder {
  flex-grow: 1;
}
.placeholder span {
  float: right;
  margin-right: 5px;
}
.display {
  padding: 4px;
  background-color: #f2f2f2;
  display: flex;
  align-items: center;
}

.display_val {
  flex-grow: 1;
}
.display .caret {
  padding-right: 8px;
  height: min-content;
}

.display div {
  display: flex;
  align-items: center;
}
.display p {
  margin: 0;
  font-size: 14px;
}

.display .chip {
  user-select: none;
  display: inline-block;
  font-size: 14px;
  background-color: #61c395;
  color: #fff;
  font-weight: bold;
  letter-spacing: 0.8px;
  margin: 3px;
  padding: 5px 15px;
  border-radius: 8px;
  word-break: break-all;
}

.list {
  position: absolute;
  top: 46px;
  background-color: #f2f2f2;
  width: 100%;
  z-index: 2;
  max-height: 200px;
  overflow: scroll;
  outline: none;
}

.list ul {
  padding: 0;
}

li {
  align-items: center;
  display: flex;
  list-style: none;
  padding: 4px 14px;
  border: none;
  border-bottom: 1px solid #d2d2d2;
}

li:hover {
  background-color: #fafafa;
  cursor: pointer;
}
li input {
  user-select: none;
}
li p {
  margin: 0;
  padding-left: 10px;
  user-select: none;
}

.add_title {
  font-size: 12px;
  font-weight: bold;
}
.add_val {
  font-size: 14px;
}

.select_all {
  padding: 14px;
  border-color: #707070;
  /*border-style: dashed;*/
}
</style>

<style></style>
