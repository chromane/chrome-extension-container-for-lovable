<script setup lang="ts">
import ctrl_frame from '@src/ts/ctrl_frame';
import PageMain from '../pages/PageMain.vue';
import PageCraigslist from '../pages/PageCraigslist.vue';
import PageAuth from '../pages/PageAuth.vue';
import PageFeedback from '../pages/PageFeedback.vue';
import PagePopup from '../pages/PagePopup.vue';
import PageDebugger from '../pages/PageDebugger.vue';
import PageSettings from '../pages/PageSettings.vue';
import PageAccount from '../pages/PageAccount.vue';
import PageRemoteConfig from '../pages/PageRemoteConfig.vue';
import PageUnlock from '../pages/PageUnlock.vue';
//
import { getCurrentInstance } from 'vue';
let instance = getCurrentInstance();
console.log('instance', instance);
console.log('instance', instance.appContext.config.globalProperties.appName);
// console.log('instance', instance.con appContext.appName);
// const app = getCurrentInstance();
// console.log();
</script>

<template>
  <div class="page_container">
    <!-- Pages -->
    <PageMain v-if="ctrl_frame.store.active_page_name === 'main'"></PageMain>
    <PageAuth v-if="ctrl_frame.store.active_page_name === 'auth'"></PageAuth>
    <PageUnlock v-if="ctrl_frame.store.active_page_name === 'unlock'"></PageUnlock>
    <PageFeedback v-if="ctrl_frame.store.active_page_name === 'feedback'"></PageFeedback>
    <PageAccount v-if="ctrl_frame.store.active_page_name === 'account'"></PageAccount>
    <PagePopup v-if="ctrl_frame.store.active_page_name === 'popup'"></PagePopup>
    <PageDebugger v-if="ctrl_frame.store.active_page_name === 'debugger'"></PageDebugger>
    <PageSettings v-if="ctrl_frame.store.active_page_name === 'settings'"></PageSettings>
    <PageRemoteConfig v-if="ctrl_frame.store.active_page_name === 'remote_config'"></PageRemoteConfig>
    <!-- Tables -->
    <!--  -->
  </div>
</template>

<style>
.page_container {
  display: block;
  width: 100%;
  height: calc(100% - 55px);
}

.tool_container {
  display: block;
  width: 100%;
  height: 100%;
}

.page {
  overflow: auto;

  width: 100%;
  height: 100%;

  padding: 24px;
}

.page.active {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
@src/ts/ctrl_frame
