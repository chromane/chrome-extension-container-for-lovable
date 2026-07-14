<script setup lang="ts">
import ctrl_frame from '@src/ts/ctrl_frame';
import console_log from '@shared/ts/console_log';
import Button from '../comp/Button.vue';
import { clone, decode_json, download_string, encode_json, get_id } from '@shared/ts/helpers';
import { pretty_time } from '@shared/ts/parser';
import ctrl_content from '@src/ts/ctrl_content';

import mdi_download from '@mdi/svg/svg/download.svg?raw';

async function send_test_request_1() {
  let result = await chrome.runtime.sendMessage({ name: 'api_add_row', data: {} });
  console_log('result', result);
  ctrl_frame.toasts.show_toast({
    type: 'info',
    title: 'Request sent',
    text: encode_json(result).slice(0, 180),
  });
}

async function download_page_html() {
  let result = await chrome.tabs.sendMessage(ctrl_frame.tab_id, { name: 'get_page_data', data: {} });
  download_string(result, `page-${get_id()}.json`);
}

//
</script>

<template>
  <div class="page main">
    <div class="page-inner">
      <Button
        :model="{
          icon: mdi_download,
          text: 'download_page_html',
        }"
        v-on:button_click="download_page_html"
        class="mb-2"
      ></Button>
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
