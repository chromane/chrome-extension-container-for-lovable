<script setup lang="ts">
import Toasts from './core/Toasts.vue';
import BlockingOverlay from './core/BlockingOverlay.vue';
</script>

<template>
  <div id="content_vue_app">
    <Toasts :model="{ position: 'left' }"></Toasts>
    <BlockingOverlay></BlockingOverlay>
  </div>
</template>
<style>
#content-vue-app-root {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
  z-index: 999999999;
  pointer-events: none;
  #app {
    height: 100%;
    width: 100%;
  }
  * {
    font-family: Roboto, sans-serif;
    box-sizing: border-box;
  }
}
</style>
