<template>
  <div>
    <v-menu>
      <template #activator="{ props }">
        <div class="sel_locale" v-bind="props">
          <span class="flag fi" :class="flag"></span>
          <span class="lang-label">
            {{ currentLang?.nativeName }}
          </span>
        </div>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :active="item.code === currentLang?.code"
          :value="index"
        >
          <v-list-item-title @click="onSelectedChange(item.code)">
            {{ item.nativeName }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import type { LanguageItem } from "@/components/misc/LanguageSelect/types";

import { defineComponent } from "vue";

import { useI18n } from "vue-i18n";
import ISO_LANGS_MAP from "@/constants/iso-lang-map";

interface FLAG_DICT {
  [key: string]: string;
}
const FLAGS_OVERRIDE: FLAG_DICT = {
  en: "us",
  zh_hant: "cn",
  zh_hans: "cn",
  cs: "cz",
  ca: "es-ca",
  uk: "ua",
  af: "za",
  ar: "ae",
  da: "dk",
  el: "gr",
  he: "il",
  nb: "no",
  sr: "rs",
  sv: "se",
  ja: "jp",
};

export const LanguageSelect = defineComponent({
  data() {
    return {
      locale: "en",
    };
  },
  computed: {
    i18n() {
      const i18n = useI18n();
      return i18n;
    },
    flag() {
      const selCode = this.locale;
      return `fi-${FLAGS_OVERRIDE[selCode] ?? selCode}`;
    },
    items(): LanguageItem[] {
      const res = [];
      const messages = this.i18n.messages.value;
      for (const langCode in messages) {
        const data = ISO_LANGS_MAP[langCode];
        if (data) {
          res.push({
            code: langCode,
            name: data.name,
            nativeName: data.nativeName,
          });
        }
      }
      return res;
    },
    currentLang(): LanguageItem | undefined {
      return this.items.find((_) => _.code === this.locale);
    },
  },
  mounted() {
    this.locale = this.i18n.locale.value;
  },
  methods: {
    onSelectedChange(val: string) {
      this.locale = val;
      this.i18n.locale.value = val;
      localStorage.setItem("lang", val);
    },
  },
});
export default LanguageSelect;
</script>

<style scoped lang="scss">
.flag {
  flex-shrink: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.sel_outlined {
  border-color: #1d82bb !important;
  color: #1d82bb !important;
}

.lang-label {
  flex-grow: 1;
  margin-left: 10px;
  color: var(--primary-color);
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }
}

select {
  outline: none;
  flex-grow: 1;
  margin-left: 10px;
  color: var(--primary-color);
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }

  option {
    color: red;

    &:hover {
      color: blue;
    }
  }
}

@media only screen and (max-width: 600px) {
  .sel_locale {
    width: min-content;
  }

  p.selected {
    display: none;
  }
}
</style>

<style lang="scss">
.sel_locale {
  .vs__dropdown-toggle {
    border-color: var(--primary-color-light) !important;
  }
}
</style>
