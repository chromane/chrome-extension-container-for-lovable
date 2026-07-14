<script setup lang="ts">
import OverlayConfirm from '@src/vue/dialogs/OverlayConfirm.vue';
import OverlayForm from '@src/vue/dialogs/OverlayForm.vue';
import ctrl from '@src/ts/ctrl_frame';
</script>

<template>
  <div class="dialogs-main">
    <div class="dialog-container">
      <div class="dialog" v-for="dialog in ctrl.dialogs.store.dialog_arr">
        <OverlayConfirm v-if="dialog.dialog_name === 'confirm'" :model="dialog"></OverlayConfirm>
        <OverlayForm v-if="dialog.dialog_name === 'form'" :model="dialog"></OverlayForm>
      </div>
    </div>
  </div>
</template>

<style>
.dialogs-main {
  .dialog {
  }
}
</style>
