<script setup lang="ts">
import { reactive, ref } from 'vue';
import { wait } from '@shared/ts/helpers';
import logo_wide from '@shared/slots/logo-main.svg?raw';

const props = defineProps<{
  drawer_items: any;
  top_icon?: string;
  ctrl: any;
  store: any;
}>();

let model = reactive({
  status: 'closed',
  footer_text: '',
});

// methods
let ref_drawer_overlay = ref(null);
async function open() {
  if (ref_drawer_overlay.value) {
    ref_drawer_overlay.value.style.display = 'block';
    await wait(20);
    ref_drawer_overlay.value.classList.add('opened');
  }
}
async function close() {
  if (ref_drawer_overlay.value) {
    ref_drawer_overlay.value.classList.remove('opened');
    await wait(200);
    ref_drawer_overlay.value.style.display = 'none';
    model.status = 'closed';
  }
}
function drawer_item_click(data) {
  props.ctrl.drawer_item_click(data);
  close();
}
function drawer_overlay_click() {
  close();
}
function drawer_click(data) {
  data.event.stopPropagation();
}

defineExpose({
  open,
});

function get_logo_wide_url() {
  return chrome.runtime.getURL('img/logo-256.png');
}
</script>
<template>
  <div id="drawer_overlay" ref="ref_drawer_overlay" v-on:click="drawer_overlay_click" v-bind:class="{ opened: model.status === 'opened' }">
    <div id="drawer" v-on:click="drawer_click({ event: $event })">
      <div id="drawer_header">
        <div class="logo-wide">
          <img :src="get_logo_wide_url()" style="height: 32px" />
        </div>
      </div>
      <div class="drawer_item_container">
        <div
          class="drawer_item"
          :class="{
            hidden: item.hidden,
          }"
          :key="item.name"
          v-for="item in props.drawer_items"
          v-on:click="drawer_item_click(item)"
        >
          <div class="svg" v-html="item.icon"></div>
          <span v-text="item.title" v-tippy="item.hint"></span>
        </div>
      </div>
      <div id="drawer_footer" v-if="model.footer_text" v-text="model.footer_text"></div>
    </div>
  </div>
</template>

<style>
/* tools_css */

#drawer_overlay {
  position: absolute;
  display: none;
  z-index: 3000;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.2s ease;
}

#drawer {
  position: absolute;
  top: 0px;
  left: -257px;
  width: 257px;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.2s ease;
  .section-headline {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.75);
    margin: 8px 0px 0px 0px;
    padding: 16px 12px 8px 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
}

#drawer_overlay.opened {
  background-color: rgba(0, 0, 0, 0.6);
}

#drawer_overlay.opened #drawer {
  left: 0px;
}
#drawer_header {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  height: 56px;
  padding-left: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  font-size: 16px;
}

.logo-wide svg {
  display: block;
  width: 24px;
  height: 24px;
}

.drawer_item.hidden {
  display: none;
}

img.drawer_item_icon {
  width: 20px;
  height: 20px;
  margin-right: 24px;
}

.drawer_item svg {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.drawer_item path {
  fill: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item span {
  font-size: 13px;
  font-weight: 600;
  color: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item:hover path {
  fill: rgb(0, 0, 0);
}

.drawer_item:hover span {
  color: rgb(0, 0, 0);
}

/*  */

#drawer_footer {
  background: #eee;
  padding: 24px;
  font-size: 13px;
  color: #444;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
#drawer_overlay {
  position: absolute;
  display: none;
  z-index: 3000;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.2s ease;
}

#drawer {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0px;
  left: -275px;
  width: 275px;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.drawer_item_container {
  flex-grow: 1;
  overflow: auto;
  padding: 8px 0px;
}

.drawer_item {
  box-sizing: content-box !important;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 20px;
  padding: 10px 0px 10px 24px;
  cursor: pointer;
}

.drawer_item.visible {
  display: flex;
}

img.drawer_item_icon {
  width: 20px;
  height: 20px;
  margin-right: 24px;
}

.drawer_item svg {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  display: block;
}

.drawer_item path {
  fill: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item span {
  font-size: 13px;
  font-weight: 600;
  color: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item:hover path {
  fill: rgb(0, 0, 0);
}

.drawer_item:hover span {
  color: rgb(0, 0, 0);
}
</style>
