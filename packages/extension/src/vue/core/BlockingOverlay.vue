<script setup lang="ts">
import svg_ripple from '@src/svg/ripple.svg?raw';
import { getCurrentInstance } from 'vue';
// import svg_ripple from "@src/svg/ripple.svg?raw";

let instance = getCurrentInstance();
let ctrl = instance.appContext.config.globalProperties.ctrl;

console.log('instance', ctrl);

const emit = defineEmits<{
  (e: 'menu_button_click'): void;
  (e: 'back_button_click'): void;
  (e: 'close_button_click'): void;
}>();
</script>

<template>
  <div
    class="blocking-overlay flex items-center justify-center"
    :class="{
      active: ctrl.store.number_of_blocking_operations > 0,
    }"
  >
    <div class="svg" v-html="svg_ripple"></div>
  </div>
</template>

<style>
.blocking-overlay {
  z-index: 999000;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  visibility: hidden;
  transition: all 0.2s ease;
  opacity: 0;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: default;
  &.active {
    opacity: 1;
    visibility: visible;
  }
  .svg {
    svg {
      display: block;
      width: 128px;
      height: 128px;
      * {
        stroke: var(--color-primary);
      }
    }
  }
}
</style>
