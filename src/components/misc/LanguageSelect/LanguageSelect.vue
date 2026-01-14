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
<script lang="ts" setup>
import type { LanguageItem } from "@/components/misc/LanguageSelect/types";

import { manageLocalization } from '@/composables/manage-localizations';
import { SUPPORTED_LANGS } from "@/constants";
import ISO_LANGS_MAP from "@/constants/iso-lang-map";

const { currentLocale, loadLocalization } = manageLocalization()

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

const locale = computed(() => currentLocale.value);

const flag = computed(() => {
  const selCode = locale.value;
  return `fi-${FLAGS_OVERRIDE[selCode] ?? selCode}`;
});

const items = computed(() =>
  SUPPORTED_LANGS.reduce((accum: LanguageItem[], langCode) => {
    const data = ISO_LANGS_MAP[langCode];
    if (data) {
      accum.push({
        code: langCode,
        name: data.name,
        nativeName: data.nativeName,
      });
    }
    return accum;
  }, []),
);

const currentLang = computed<LanguageItem | undefined>(() => {
  return items.value.find((_) => _.code === locale.value);
});

function onSelectedChange(val: string) {
  loadLocalization(val);

  localStorage.setItem("lang", val);
}
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
