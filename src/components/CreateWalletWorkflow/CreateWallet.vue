<template>
  <div class="create_wallet">
    <div class="w-container">
      <div class="w-row">
        <div class="w-col">
          <transition mode="out-in" name="fade">
            <!-- PHASE 1 -->
            <div v-if="!keyPhrase" class="stage_1">
              <div class="img_container">
                <img v-if="isDay" src="@/assets/diamond-secondary.svg" />
                <img v-else src="@/assets/diamond-secondary-night.svg" />
              </div>
              <h1>{{ $t("create.generate") }}</h1>
              <router-link class="link" to="/access">
                {{ $t("create.but_have") }}
              </router-link>
              <div class="options">
                <button
                  class="ava_button but_generate button_secondary"
                  @click="createKey"
                >
                  {{ $t("create.submit") }}
                </button>
                <!--                                <TorusGoogle class="torus_but"></TorusGoogle>-->
              </div>
              <ToS></ToS>

              <router-link class="link" to="/">{{
                $t("create.cancel")
              }}</router-link>
            </div>
            <!-- PHASE 2 -->
            <div v-else class="stage_2">
              <div class="cols">
                <!-- LEFT -->
                <div class="mneumonic_disp_col">
                  <div class="mnemonic_disp">
                    <MnemonicDisplay
                      :bg-color="verificationColor"
                      class="mnemonic_display"
                      :phrase="keyPhrase"
                    ></MnemonicDisplay>
                  </div>
                </div>
                <!-- RIGHT -->
                <div class="phrase_disp_col">
                  <header v-if="!isVerified">
                    <h1>
                      {{ $t("create.mnemonic_title") }}
                    </h1>
                    <p>{{ $t("create.mnemonic_desc") }}</p>
                  </header>
                  <header v-else>
                    <h1>
                      {{ $t("create.success_title") }}
                    </h1>
                    <p>{{ $t("create.success_desc") }}</p>
                  </header>
                  <p v-if="!isVerified" class="warn">
                    <span class="label">{{ $t("create.attention") }}</span>
                    <span class="description">{{ $t("create.warning") }}</span>
                  </p>
                  <!-- STEP 2a - VERIFY -->
                  <div v-if="!isVerified" class="verify_cont">
                    <MnemonicCopied
                      v-model="isSecured"
                      :explain="$t('create.confirm')"
                    ></MnemonicCopied>
                    <VerifyMnemonic2
                      v-if="keyPhrase"
                      ref="verify"
                      :mnemonic="keyPhrase"
                      @complete="complete"
                    ></VerifyMnemonic2>
                    <button
                      class="but_primary ava_button button_secondary"
                      :disabled="!canVerify"
                      @click="verifyMnemonic"
                    >
                      {{ $t("create.success_submit") }}
                    </button>
                  </div>
                  <!-- STEP 2b - ACCESS -->
                  <div v-if="isVerified" class="access_cont">
                    <div class="submit">
                      <transition mode="out-in" name="fade">
                        <Spinner v-if="isLoad" class="spinner"></Spinner>
                        <div v-else>
                          <button
                            class="button_secondary ava_button access generate"
                            :disabled="!canSubmit"
                            @click="access"
                          >
                            {{ $t("create.success_submit") }}
                          </button>
                          <router-link class="link" to="/">
                            Cancel
                          </router-link>
                          <ToS style="margin: 30px 0 !important"></ToS>
                        </div>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import * as bip39 from "bip39";
import { defineComponent, ref } from "vue";
import MnemonicCopied from "@/components/CreateWalletWorkflow/MnemonicCopied.vue";
import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";

import Spinner from "@/components/misc/Spinner.vue";
import ToS from "@/components/misc/ToS.vue";
import VerifyMnemonic2 from "@/components/modals/VerifyMnemonic2.vue";
import { useOwnTheme } from "@/composables/use-own-theme";
import MnemonicPhrase from "@/js/wallets/MnemonicPhrase";

export const CreateWallet = defineComponent({
  components: {
    ToS,
    MnemonicDisplay,
    Spinner,
    VerifyMnemonic2,
    MnemonicCopied,
  },
  setup() {
    const { isDay } = useOwnTheme();

    const keyPhrase = ref<MnemonicPhrase>();

    return { isDay, keyPhrase };
  },
  data(): {
    isLoad: boolean;

    isSecured: boolean;
    isVerified: boolean;
  } {
    return {
      isLoad: false,
      isSecured: false,
      isVerified: false,
    };
  },
  computed: {
    canVerify(): boolean {
      return this.isSecured ? true : false;
    },
    verificationColor() {
      return this.isVerified ? "#a9efbf" : "#F5F6FA";
    },
    canSubmit(): boolean {
      return true;
    },
  },
  methods: {
    createKey(): void {
      this.isSecured = false;
      const mnemonic = bip39.generateMnemonic(256);
      const a = new MnemonicPhrase(mnemonic);
      this.keyPhrase = a as MnemonicPhrase;
    },
    verifyMnemonic() {
      (this.$refs.verify as typeof VerifyMnemonic2).open();
    },
    complete() {
      this.isVerified = true;
    },
    async access(): Promise<void> {
      if (!this.keyPhrase) return;

      this.isLoad = true;
      setTimeout(async () => {
        await this.$store.dispatch("accessWallet", this.keyPhrase!.getValue());
      }, 500);
    },
  },
});
export default CreateWallet;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.create_wallet {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ==========================================
   stage_1
   ========================================== */

.stage_1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: vars.$container-padding;
  text-align: center;
  /*min-width: 1000px;*/

  img {
    margin-top: vars.$vertical-padding;
    width: 89px;
    height: 89px;
    max-height: none;
  }

  h1 {
    margin-top: vars.$vertical-padding;
    text-align: left;
    font-size: 28px;
    font-weight: 700;
    color: var(--tertiary-color);
  }
}

.options {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px;
  padding-top: 15px;

  > * {
    margin: 4px;
    font-size: 0.8rem;
  }

  p {
    color: #999;
    margin: 6px !important;
  }
}

.torus_but {
  background-color: #db3236;
  color: #fff;
}

.but_generate {
  display: block;
  height: max-content;
  background-color: vars.$secondary-color;
}

.key_disp {
  margin: 30px auto;
  font-size: 12px;
}

a {
  color: var(--secondary-color) !important;
  text-decoration: none !important;
  margin-top: 10px;
}

/* ==========================================
   mneumonic
   ========================================== */

.stage_2 {
  margin: 0 auto;
  text-align: left;
  align-items: flex-start;
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 60px;
}

.mneumonic_disp_col {
  .mnemonic_disp {
    max-width: 560px;
    justify-self: center;
    display: flex;
    flex-direction: column;
  }

  .phrase_raw {
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 14px 24px;
    text-align: justify;
    border-radius: 4px;
    margin: 30px 0px !important;
  }

  .mnemonic_display {
    background-color: var(--bg-light);
    padding: 14px;
  }

  .verified {
    background-color: vars.$green-light;
    color: #222;
  }

  .mnemonic_button_container {
    .but_randomize {
      span {
        margin-left: 12px;
      }
    }
  }
}

.phrase_disp_col {
  padding: 0 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  > * {
    width: 100%;
  }

  img {
    width: vars.$img-size;
    height: vars.$img-size;
    max-height: none;
  }

  header {
    h1 {
      margin-top: 10px;
      margin-bottom: 26px;
      font-size: 28px;
      line-height: 1.25em;
      font-weight: 700;
      color: var(--tertiary-color);
    }

    p {
      color: vars.$primary-color-light;
      font-weight: 400;
      font-size: 20px;
    }
  }

  .warn {
    margin-top: vars.$vertical-padding !important;

    span {
      display: block;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      margin-top: 20px;
      margin-bottom: 16px;

      &.label {
        color: var(--secondary-color);
        text-transform: uppercase;
      }

      &.description {
        color: vars.$primary-color-light !important;
      }
    }
  }

  .access_cont {
    text-align: left;
    flex-direction: column;

    .submit {
      display: flex;
      flex-direction: row;
      margin-top: 14px;
      text-align: left;
      //flex-direction: column;
      //align-items: flex-start;
      //justify-content: space-between;

      .access {
      }

      .link {
        margin-left: 40px;
      }
    }
  }
}

.spinner {
  width: 26px !important;
  margin: 0px auto;
}

.remember_wallet {
  margin: 20px 0;
}

@include mixins.medium-device {
  .stage_1 {
    min-width: unset;
  }
}

@include mixins.mobile-device {
  .stage_1 {
    min-width: unset;
  }

  .stage_2 {
    min-width: unset;
  }

  .access {
    margin: 30px auto;
    width: 100%;
  }

  .cols {
    display: block;
  }

  .options {
    margin: 30px 0px;
    flex-direction: column;

    > button {
      width: 100%;
    }
  }

  .mneumonic_disp_col {
    .mnemonic_disp {
      margin: 0 auto;
    }

    .mnemonic_button_container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      .copy_phrase {
        margin-right: 0;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
      }

      .but_randomize {
        margin-top: 10px;

        span {
          margin-left: 12px;
        }
      }
    }
  }

  .phrase_disp_col {
    padding: 30px 0;
    align-items: center;

    img {
      width: vars.$img-size-mobile;
      height: vars.$img-size-mobile;
    }

    header {
      h1 {
        font-size: vars.$xl-size-mobile;
      }
    }

    .warn {
      margin-top: vars.$vertical-padding-mobile !important;
    }

    .access_cont {
      .submit {
        flex-direction: column;
        justify-content: center;

        > div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .link {
          margin: auto;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.create_wallet {
  .remember_wallet {
    .v-expansion-panel-header,
    .v-expansion-panel-content__wrap {
      padding: 6px 0;
    }
  }
}
</style>
