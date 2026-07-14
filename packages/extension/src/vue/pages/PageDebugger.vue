<script setup lang="ts">
import ctrl_frame from '@src/ts/ctrl_frame';
import Button from '../comp/Button.vue';
import { clone, download_string, encode_json } from '@shared/ts/helpers';
import { pretty_time } from '@shared/ts/parser';
import ctrl_content from '@src/ts/ctrl_content';

async function download_data() {
  let page_data = await ctrl_frame.get_page_data();
  let data = {
    ts: Date.now(),
    ts_pretty: pretty_time(Date.now()),
    page_data,
    manifest: chrome.runtime.getManifest(),
    // messages: clone(ctrl_frame.store.messages),
  };
  download_string(encode_json(data), `data-${Date.now()}.json`);
}
//
</script>

<template>
  <div class="page main">
    <div class="page-inner">
      <Button
        :model="{
          text: 'Download data',
        }"
        v-on:button_click="download_data"
        class="mb-2"
      ></Button>
      <div class="message-container">
        <div class="message" v-for="message in ctrl_frame.store.messages">
          <span v-text="message.source + ': '"></span>
          <span v-text="message.source"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.page.main {
  background-color: white;
  .mb-2 {
    margin-bottom: 12px;
  }
  .message-container {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-border);
    .message {
      padding: 4px 0px;
      border-bottom: 1px solid var(--color-border);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }
  }
}
</style>
@src/ts/ctrl_frame
