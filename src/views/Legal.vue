<template>
  <div>
    <div class="legal_cont">
      <ToSCoreContent v-if="isCore"></ToSCoreContent>
      <ToSContent v-else></ToSContent>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ToSContent from "@/components/misc/ToSContent.vue";
import ToSCoreContent from "@/components/misc/ToSCoreContent.vue";

export const Legal = defineComponent({
  components: { ToSContent, ToSCoreContent },
  computed: {
    isCore() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("core")) {
        return true;
      }
      return false;
    },
  },
});
export default Legal;
</script>
<style scoped lang="scss">
.legal_cont {
  display: flex;
  flex-direction: column;
  padding-bottom: 4vh;
}
</style>
