<template>
  <modal ref="modal" class="modal_parent" icy :title="title">
    <div class="mnemonic_body">
      <button class="close_but" @click="close">
        <fa icon="times"></fa>
      </button>
      <h3>{{ $t("create.verify_desc") }}</h3>
      <div class="words">
        <div v-for="i in 24" :key="i" class="mnemonic_in" tabindex="-1">
          <p>{{ i }}.</p>
          <input
            v-model="keysIn[i - 1]"
            :disabled="!hiddenIndices.includes(i - 1)"
            type="text"
          />
        </div>
      </div>
      <p class="err">{{ err }}</p>
      <button class="but_primary ava_button button_secondary" @click="verify">
        Verify
      </button>
    </div>
  </modal>
</template>

<script lang="ts">
import type MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";

export default defineComponent({
  components: {
    Modal,
  },
  props: {
    mnemonic: {
      type: Object as PropType<MnemonicPhrase>,
    },
  },
  emits: ["complete"],
  data() {
    const hiddenIndices: number[] = [];
    const keysIn: string[] = [];

    return {
      isActive: false,
      keysIn,
      hiddenIndices,
      err: "",
      title: "",
    };
  },
  computed: {
    words() {
      return this.mnemonic ? this.mnemonic.getValue().split(" ") : [];
    },
  },
  watch: {
    mnemonic: [
      {
        handler: "onmnemonicchange",
      },
    ],
  },
  created() {
    this.init();
    this.title = `${this.$t("create.verifytitle")}`;
  },
  methods: {
    init() {
      const wordsLen = 24;
      this.keysIn = Array.from({ length: wordsLen }).join(".").split(".");

      // Hide 4 words
      const hideNum = 4;
      const hidden: number[] = [];

      while (hidden.length < hideNum) {
        const hideIndex = Math.floor(Math.random() * wordsLen);
        if (!hidden.includes(hideIndex)) {
          hidden.push(hideIndex);
        }
      }

      for (const [i, word] of this.words.entries()) {
        if (!hidden.includes(i)) {
          this.keysIn[i] = word;
        }
      }

      this.hiddenIndices = hidden;
    },
    open() {
      // @ts-ignore
      this.$refs.modal.open();
    },
    close() {
      this.isActive = false;
    },
    formCheck() {
      this.err = "";
      const userWords = this.keysIn;

      for (const [i, userWord_] of userWords.entries()) {
        const userWord = userWord_.trim();
        const trueWord = this.words[i]?.trim();

        if (userWord.length === 0) {
          this.err = `Oops, looks like you forgot to fill number ${i + 1}`;
          return false;
        }

        if (userWord !== trueWord) {
          this.err = `The mnemonic phrase you entered for word ${
            i + 1
          } not match the actual phrase.`;
          return false;
        }
      }

      return true;
    },
    verify() {
      if (!this.formCheck()) return;
      // @ts-ignore
      this.$refs.modal.close();
      this.$emit("complete");
    },
    onmnemonicchange(_: string) {
      this.init();
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.mnemonic_body {
  padding: 30px;
  text-align: center;
  max-width: 100%;
  width: 450px;
}

.close_but {
  position: absolute;
  top: 12px;
  right: 20px;
  background-color: transparent;
  border: none;
  outline: none;
  opacity: 0.2;

  &:hover {
    opacity: 1;
  }
}

.verify {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.content {
  position: relative;
  background-color: #fff;
  padding: 40px 30px;
  max-width: 100%;
  width: 700px;
  z-index: 1;
  border-radius: 14px;
}

h3 {
  margin-bottom: 30px;
}

.words {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  font-size: 1rem;
  margin-bottom: 30px;
}

.mnemonic_in {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid vars.$primary-color-light;
  outline: none;

  p {
    margin: 0 5px 0 0 !important;
    color: vars.$primary-color-light;
  }

  input {
    color: var(--primary-color);
    background-color: transparent;
    font-weight: 700;
    margin: 0;
    border: none;
    width: 40px;
    flex-grow: 1;

    &[disabled] {
      outline: none;
      pointer-events: none;
      opacity: 0.6;
    }
  }
}

.but_primary {
  width: 80%;
  margin: 0px auto;
  padding: 8px 30px;
}

.err {
  height: 60px;
  margin: 0px auto;
  text-align: left;
  color: var(--error);
}

@include mixins.mobile-device {
  .mnemonic-body {
    width: 100%;
  }

  .words {
    font-size: 0.8rem;
    grid-gap: 14px;
  }
}
</style>
