<template>
  <div class="home">
    <div class="w-container">
      <div class="w-row">
        <div class="w-col">
          <div class="home_wrapper">
            <h1>{{ $t("home.desc") }}</h1>
            <div class="login_wrapper">
              <div class="login_option">
                <header>
                  <div class="img_container">
                    <img v-if="isDay" src="@/assets/diamond-primary.svg" />
                    <img v-else src="@/assets/diamond-primary.svg" />
                  </div>
                  <h2>{{ $t("home.access.title") }}</h2>
                  <p>{{ $t("home.access.desc") }}</p>
                </header>
                <div>
                  <router-link
                    class="ava_button button_tertiary submit_but"
                    data-cy="access"
                    to="/access"
                  >
                    {{ $t("home.access.submit") }}
                  </router-link>
                </div>
              </div>
              <div class="login_option">
                <header>
                  <div class="img_container">
                    <img v-if="isDay" src="@/assets/diamond-secondary.svg" />
                    <img v-else src="@/assets/diamond-secondary.svg" />
                  </div>
                  <h2>{{ $t("home.create.title") }}</h2>
                  <p>{{ $t("home.create.desc") }}</p>
                </header>
                <div>
                  <router-link
                    class="ava_button button_secondary submit_but"
                    data-cy="create"
                    to="/create"
                  >
                    {{ $t("home.create.submit") }}
                  </router-link>
                </div>
              </div>
            </div>
            <ToS
              class="tos"
              style="align-self: center; margin: 30px !important"
            ></ToS>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ToS from "@/components/misc/ToS.vue";
import { useOwnTheme } from "@/composables/use-own-theme";

export const Home = defineComponent({
  name: "Home",
  components: { ToS },
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
});
export default Home;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.home {
  padding-top: 100px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;

  a {
    margin: 10px;
    text-align: center;
    display: block;
  }

  .home_wrapper {
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;

    h1 {
      text-align: center;
      font-size: 22px;
      font-weight: 400;
      color: var(--primary-color-light);
    }

    .login_wrapper {
      margin-top: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: vars.$container-padding;

      .login_option {
        display: flex;
        flex-direction: column;
        border-radius: 2px;
        align-items: center;
        justify-content: space-between;
        padding: 60px 90px vars.$container-padding vars.$container-padding;

        header {
          margin-bottom: 24px;
          text-align: center;

          img {
            width: 48px;
            height: 48px;
            max-height: none;
          }

          h2 {
            padding-top: vars.$s-size;
            font-family: "Inter", sans-serif;
            font-size: vars.$s-size;
            font-weight: 400;
            color: var(--primary-color-light);
          }

          p {
            margin-top: 10px !important;
            font-size: vars.$l-size;
            color: var(--tertiary-color);
            font-weight: 700;
          }
        }

        a {
          margin: 0;
        }
      }
    }
  }
}

.tos {
  margin-top: 14px !important;
}

.submit_but {
  width: max-content;
}
/* ==========================================
   Nav
   ========================================== */
.logo {
  margin-bottom: 30px;
}

img {
  max-height: 50px;
  object-fit: contain;
}

@include mixins.medium-device {
  .login_option {
    padding: 30px 40px !important;
    p {
      font-size: 1.4rem !important;
    }
  }
}

@include mixins.mobile-device {
  .auth {
    border-radius: 0;
    box-shadow: none;
  }

  .menu_option {
    padding: 5vh 12px;
  }
  .menu_option button {
    width: 100%;
    padding: 8px;
  }

  .imgcover {
    display: none;
  }

  .home {
    .home_wrapper {
      h1 {
        font-size: vars.$xl-size-mobile;
      }

      .login_wrapper {
        grid-template-columns: none;
        display: flex;
        flex-direction: column;

        .login_option {
          margin-bottom: vars.$vertical-padding;
          padding: 30px 15px;
          align-items: center;

          header {
            display: flex;
            flex-direction: column;
            align-items: center;

            margin-bottom: 30px;

            img {
              width: 40px;
              height: 40px;
            }

            h2 {
              padding-top: vars.$s-size-mobile;
              font-size: vars.$s-size-mobile;
            }

            p {
              margin-top: 10px !important;
              font-size: vars.$l-size-mobile;
              text-align: center;
            }
          }

          a {
            margin: 0;
          }
        }
      }
    }
  }
}
</style>
