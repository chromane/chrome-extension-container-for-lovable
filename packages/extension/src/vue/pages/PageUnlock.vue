<script setup lang="ts">
import MessageSimple from '@src/vue/comp/MessageSimple.vue';
import Button from '@src/vue/comp/Button.vue';
import { onMounted, reactive, watch } from 'vue';
import Form from '@src/vue/form/Form.vue';

import mdi_arrow_up from '@mdi/svg/svg/arrow-up.svg?raw';
import icon_embank_ai from '@shared/slots/logo-black.svg?raw';
// @ts-ignore
import show_confetti from '@src/ts/show_confetti';
import ctrl_frame from '@src/ts/ctrl_frame';
import { RESPONSE_CODE } from '@shared/types/common';
import { decode_jwt } from '@shared/ts/helpers';

let state: any = {
  interval: 0,
};

type MessageType = 'info' | 'positive' | 'negative';
type MessageMap = {
  [type in MessageType]: {
    type: MessageType;
    title: string;
    text: string;
  };
};

let model = reactive({
  //
  form_state: {
    secret_code: '',
  },
  form_fields: [
    {
      name: 'secret_code',
      type: 'text',
      title: 'Secret code',
      placeholder: 'A secret code',
    },
  ],
  message_type: 'info' as MessageType,
});

async function unlock() {
  ctrl_frame.blocking_inc();
  //
  let result = await ctrl_frame.proxy_backend.project.unlock_user(ctrl_frame.store.auth.jwt_token, model.form_state.secret_code);
  if (result.code === RESPONSE_CODE.SUCCESS) {
    ctrl_frame.toasts.show_toast({
      type: 'success',
      title: 'Success',
      text: 'Unlocked, feel free to continue using the extension.',
    });
    ctrl_frame.goto('account');
    ctrl_frame.store.auth = {
      jwt_token: result.jwt_token,
      jwt_claims: decode_jwt(result.jwt_token),
    };
    await chrome.storage.local.set({
      auth: {
        jwt_token: result.jwt_token,
        jwt_claims: decode_jwt(result.jwt_token),
      },
    });
  } else {
    ctrl_frame.toasts.show_toast({
      type: 'negative',
      title: 'Error',
      text: 'Cold not unlock the extension. Please check if your code is valid or try again later.',
    });
  }
  //
  ctrl_frame.blocking_dec();
}
//
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <MessageSimple
        class="mb-4"
        :model="{
          type: 'info',
          title: 'Please enter the secret code',
          text: `To unlock the extension - please enter a secret code provided to you by an admin.`,
        }"
      ></MessageSimple>
      <Form :form_state="model.form_state" :form_fields="model.form_fields"></Form>
      <Button
        :model="{
          text: 'Unlock',
        }"
        v-on:button_click="unlock"
      ></Button>
    </div>
  </div>
</template>

<style></style>
