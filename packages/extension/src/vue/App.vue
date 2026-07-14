<script setup lang="ts">
// import '@src/css/tailwind.css';
import '@src/css/dialogs.css';
import '@src/css/common.css';
import '@src/css/project.css';
import '@src/css/form.css';

import ctrl_frame from '@src/ts/ctrl_frame';
import Header from './comp/Header.vue';
import Drawer from './comp/Drawer.vue';

import Dialogs from './core/Dialogs.vue';
import PageContainer from './core/PageContainer.vue';

import { reactive, ref } from 'vue';

import Toasts from './core/Toasts.vue';
import BlockingOverlay from './core/BlockingOverlay.vue';

let ref_drawer = ref(null);

let methods = {
  header_menu_button_click: () => {
    ref_drawer.value.open();
  },
  header_back_button_click: () => {
    // ctrl_frame.arrow_button_click();
  },
  header_close_button_click: () => {
    ctrl_frame.close_button_click();
  },
};

let model = reactive({
  context: 'poppup',
});
if (location.hash === '#tab') {
  model.context = 'tab';
} else if (location.hash === '#popup') {
  model.context = 'popup';
}
</script>

<template>
  <div
    id="app-background"
    :class="{
      tab: model.context === 'tab',
      popup: model.context === 'popup',
      fullscreen: ctrl_frame.store.app_mode === 'fullscreen',
    }"
  >
    <div class="background-image" v-if="model.context === 'tab'"></div>
    <div
      id="app"
      :class="{
        tab: model.context === 'tab',
        popup: model.context === 'popup',
        fullscreen: ctrl_frame.store.app_mode === 'fullscreen',
      }"
    >
      <Header
        :nav_icon="ctrl_frame.store.nav_icon"
        v-on:menu_button_click="methods.header_menu_button_click"
        v-on:back_button_click="methods.header_back_button_click"
        v-on:close_button_click="methods.header_close_button_click"
        :store="ctrl_frame.store"
      ></Header>
      <PageContainer></PageContainer>
      <Drawer
        ref="ref_drawer"
        :ctrl="ctrl_frame"
        :store="ctrl_frame.store"
        v-bind:drawer_items="ctrl_frame.store.drawer_items"
        v-on:drawer_item_click="
          (item: any) => {
            ctrl_frame.drawer_item_click(item);
          }
        "
      ></Drawer>
      <Toasts></Toasts>
      <Dialogs></Dialogs>
      <BlockingOverlay></BlockingOverlay>
    </div>
  </div>
</template>
<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700');

#root {
  position: relative;
  z-index: 300;
}
.page {
  background-color: white;
}
html.tab {
  height: 100%;
  width: 100%;
  body {
    height: 100%;
    width: 100%;
    z-index: 100;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  #root {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #app-background {
    height: 100%;
    width: 100%;
    z-index: 100;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #app {
    height: 760px;
    width: 760px;
    max-height: 90%;
    max-width: 90%;
    position: relative;
    z-index: 400;
    display: block;
    overflow: hidden;
    border-radius: 4px;
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
  }
}

html.sidepanel {
  #vue-app-root {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
    #app-background {
      height: 100%;
      width: 100%;
      z-index: 100;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
    }
    #app {
      height: 100%;
      width: 100%;
    }
    * {
      font-family: Roboto, sans-serif;
      box-sizing: border-box;
    }
  }
}

html.window-name-chromane-popup #blocking-overlay {
  display: none;
}
</style>
