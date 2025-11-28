<template>
  <modal ref="modal" class="modal_parent" icy :title="title">
    <div class="mnemonic_body">
      <div class="">
        <div v-for="(q, i) in questions" :key="q.words[0]" class="question_row">
          <p>Select word {{ q.questionIndex + 1 }}</p>
          <div style="display: flex; justify-content: center">
            <RadioButtons
              v-model="answers[i]"
              :keys="q.words"
              :labels="q.words"
              style="margin: 0px auto"
            ></RadioButtons>
          </div>
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
import type { PropType } from "vue";
import type MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import { defineComponent } from "vue";
import RadioButtons from "@/components/misc/RadioButtons.vue";
import Modal from "@/components/modals/Modal.vue";
import { getRandomMnemonicWord } from "@/helpers/getRandomMnemonicWord";

export interface Question {
  words: [string, string, string];
  questionIndex: number; // Which index are we asking the user to verify
  answerIndex: number; // Which word is the correct option out of the 3
}

export const VerifyMnemonic2 = defineComponent({
  components: {
    RadioButtons,
    Modal,
  },
  props: {
    mnemonic: {
      type: Object as PropType<MnemonicPhrase>,
    },
  },
  emits: ["complete"],
  data() {
    const questions: Question[] = [];
    const answers: (string | undefined)[] = [undefined, undefined, undefined];
    const hiddenIndices: number[] = [];
    const keysIn: string[] = [];

    return {
      isActive: false,
      keysIn,
      hiddenIndices,
      err: "",
      title: "",
      answers,
      questions,
    };
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
      const qNum = 3;
      const usedIndex: number[] = [];
      const questions: Question[] = [];
      const mnemonic = this.mnemonic?.getValue().split(" ");
      if (!mnemonic) {
        return;
      }
      while (questions.length < qNum) {
        const randIndex = Math.floor(Math.random() * (wordsLen - 1));

        if (!usedIndex.includes(randIndex)) {
          usedIndex.push(randIndex);
          const w0 = mnemonic[randIndex];
          // Select 2 more words
          const w1 = getRandomMnemonicWord();
          const w2 = getRandomMnemonicWord();

          const words: [string, string, string] = [
            w0 ?? "",
            w1 ?? "",
            w2 ?? "",
          ];
          // Rotate until w0 is at answer index
          const answerIndex = Math.round(Math.random() * 2);
          // Shift right answerIndex times
          for (let i = 0; i < answerIndex; i++) {
            const temp = words.pop() as string;
            words.splice(0, 0, temp);
          }

          questions.push({
            words: words,
            questionIndex: randIndex,
            answerIndex: answerIndex,
          });
        }
      }

      this.questions = questions;
    },
    open() {
      // @ts-ignore
      this.$refs.modal.open();
      this.err = "";
      this.answers = [undefined, undefined, undefined];
    },
    close() {
      this.isActive = false;
      this.err = "";
    },
    formCheck() {
      this.err = "";

      for (let i = 0; i < this.questions.length; i++) {
        const question = this.questions[i];
        const answer = this.answers[i];
        if (question && question.words[question.answerIndex] != answer) {
          this.err = "You selected the wrong words.";
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
    onmnemonicchange(_: MnemonicPhrase) {
      this.init();
    },
  },
});
export default VerifyMnemonic2;
</script>
<style scoped lang="scss">
.mnemonic_body {
  padding: 30px;
  text-align: center;
  max-width: 100%;
  width: 450px;
}

.but_primary {
  width: 80%;
  margin: 0px auto;
  padding: 8px 30px;
}

.err {
  height: 60px;
  margin: 0px auto;
  text-align: center;
  color: var(--error);
}

.question_row {
  margin-bottom: 14px;
}
</style>
