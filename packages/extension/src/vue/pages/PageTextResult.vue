<script setup lang="ts">
import { watch } from 'vue';
import ctrl_frame from '@src/ts/ctrl_frame';

import show_confetti from '@src/ts/show_confetti';
//
watch(
  () => ctrl_frame.store.text_result,
  () => {
    show_confetti();
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="page settings">
    <div class="page-inner">
      <div class="text-result" v-text="ctrl_frame.store.text_result"></div>
    </div>
  </div>
</template>

<style>
.text-result {
  white-space: pre;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 12px;
  background-origin: rgba(0, 0, 0, 0.1);
  color: black;
}
</style>
