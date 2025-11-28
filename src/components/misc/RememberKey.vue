<template>
  <div>
    <v-expansion-panels flat @change="expansion_change">
      <v-expansion-panel class="expansion_panel">
        <v-expansion-panel-header>
          <v-checkbox
            v-model="isRemember"
            class="checkbox"
            :color="color"
            dense
            :hide-details="false"
            :hint="hint"
            :label="explain"
            :persistent-hint="true"
          ></v-checkbox>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div :active="isRemember" class="passwords">
            <input
              v-model="password"
              :placeholder="$t('keys.export_placeholder1')"
              type="password"
            />
            <input
              v-model="password_confirm"
              :placeholder="$t('keys.export_placeholder2')"
              type="password"
            />
            <p class="err">{{ err }}</p>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!--        <v-checkbox :label="explain" v-model="isRemember" :hint="hint" :persistent-hint="true" :hide-details="false" :color="color" dense></v-checkbox>-->
    <!--        <div class="passwords" :active="isRemember">-->
    <!--            <input type="password" :placeholder="$t('keys.export_placeholder1')" v-model="password">-->
    <!--            <input type="password" :placeholder="$t('keys.export_placeholder2')" v-model="password_confirm">-->
    <!--            <p class="err">{{err}}</p>-->
    <!--        </div>-->
  </div>
</template>
<script lang="ts">
export const RememberKey = defineComponent({
  props: {
    modelValue: String,
    color: {
      type: String,
      default: "#6BC688",
    },
    explain: {
      type: String,
    },
  },
  emits: ["update:modelValue", "is-valid", "checked"],
  data() {
    return {
      password: "",
      password_confirm: "",
      hint: this.$t("keys.remember_key_info"),
      isRemember: false,
    };
  },
  computed: {
    explainValue() {
      if (!this.explain) {
        return this.$t("keys.remember_key_check");
      }
      return this.explain;
    },
    err() {
      if (!this.isRemember) return null;

      const pass = this.password;
      const pass_confirm = this.password_confirm;
      if (pass.length < 9) {
        return this.$t("keys.password_validation");
      }

      if (pass !== pass_confirm) {
        return this.$t("keys.password_validation2");
      }
      return null;
    },

    isComplete() {
      if (!this.isRemember) return true;

      return false;
    },
  },
  watch: {
    err(val) {
      // There are no errors
      if (val) {
        this.$emit("update:modelValue", null);
        this.$emit("is-valid", false);
      } else {
        if (this.password && this.isRemember) {
          this.$emit("update:modelValue", this.password);
        } else {
          this.$emit("update:modelValue", null);
        }
        this.$emit("is-valid", true);
      }
    },
  },
  mounted() {},
  methods: {
    // change() {
    //     this.$emit("change", this.isRemember);
    // },
    clear() {
      this.password = "";
      this.password_confirm = "";
      this.isRemember = false;
    },
    expansion_change(val: any) {
      if (val === 0) {
        this.$emit("checked", true);
        this.isRemember = true;
      } else {
        this.$emit("checked", false);
        this.isRemember = false;
      }
    },
  },
});
export default RememberKey;
</script>

<style lang="scss">
@use "@/styles/abstracts/vars";

.remember {
  .v-label {
    font-size: vars.$s-size !important;
    color: var(--primary-color);
  }

  .v-messages__message {
    color: var(--primary-color);
  }
}

.checkbox {
  margin: 0px !important;
}

.v-expansion-panel-header__icon {
  display: none !important;
}
</style>
<style lang="scss" scoped>
.passwords {
  display: flex;
  flex-direction: column;
  /*margin-left: 30px;*/
  pointer-events: none;
  opacity: 0.2;
  transition-duration: 0.2s;
  padding: 15px 0px;

  &[active] {
    opacity: 1;
    pointer-events: auto;
  }

  > input {
    padding: 6px 12px;
    /*border-bottom: 1px solid #999;*/
    margin-bottom: 12px;
    background-color: var(--bg-light);
    color: var(--primary-color);
  }
}

.err {
  text-align: left;
  color: var(--error);
  height: 16px;
  font-size: 0.8rem;
}

.expansion_panel {
  background-color: var(--bg) !important;
}
</style>
