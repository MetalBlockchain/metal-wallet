<template>
  <div>
    <div>
      <div class="header_title">
        <h1>{{ $t("advanced.title") }}</h1>
        <hr />
      </div>
    </div>
    <TokenListModal ref="token_list"></TokenListModal>
    <!--        <div class="buts grid_box">-->
    <!--            <button @click="openTokenlist">Manage Token Lists</button>-->
    <!--        </div>-->
    <div class="grids">
      <SignMessage class="grid_box"></SignMessage>
      <VerifyMessage class="grid_box"></VerifyMessage>
      <ChainImport class="grid_box"></ChainImport>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import TokenListModal from "@/components/modals/TokenList/TokenListModal.vue";
import ChainImport from "@/components/wallet/advanced/ChainImport.vue";
import SignMessage from "@/components/wallet/advanced/SignMessage/SignMessage.vue";
import VerifyMessage from "@/components/wallet/advanced/VerifyMessage.vue";

export const Advanced = defineComponent({
  name: "Advanced",
  components: {
    TokenListModal,
    ChainImport,
    SignMessage,
    VerifyMessage,
  },

  methods: {
    openTokenlist() {
      (this.$refs.token_list as typeof TokenListModal).open();
    },
  },
});
export default Advanced;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.header_title {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;

  h1 {
    font-size: 20px;
    font-weight: 500;
    white-space: nowrap;
    margin-right: 12px;
    color: var(--tertiary-color);
  }

  hr {
    flex: 0 1 100%;
    border: 1px solid var(--border-secondary-light);
  }
}
h1 {
  font-weight: normal;
}
.grids {
  display: grid;
  column-gap: 14px;
  row-gap: 14px;
  grid-template-columns: repeat(2, 1fr);
}

.grid_box {
  padding: 30px;
  border-radius: 16px;
  overflow: auto;
  border: 1px solid var(--border-secondary-light);
}

@include mixins.mobile-device {
  .grids {
    grid-template-columns: none;
  }
}

@include mixins.medium-device {
  .grids {
    grid-template-columns: none;
  }
}

.buts {
  margin-bottom: 12px;
  button {
    color: var(--primary-color);
    &:hover {
      color: var(--secondary-color);
    }
  }
}
</style>
