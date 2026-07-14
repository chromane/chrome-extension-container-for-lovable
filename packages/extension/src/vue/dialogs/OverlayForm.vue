<script setup lang="ts">
import mdi_close from '@mdi/svg/svg/close.svg?raw';
import { ref, watch, nextTick, reactive } from 'vue';
import Form from '@src/vue/form/Form.vue';
import Button from '@src/vue/comp/Button.vue';
import ctrl_admin from '@src/ts/ctrl_frame';
import console_log from '@shared/ts/console_log';
import MessageSimpleLine from '../comp/MessageSimpleLine.vue';
import * as Zod from 'zod';

const props = defineProps<{
  model: any;
}>();

let model = reactive({
  active: false,
  //
  title: '',
  form_state: {},
  form_fields: [],
  //
  zod_issues: [] as Zod.ZodIssue[],
});

const overlay_inner = ref(null);
const overlay_root = ref(null);

function handle_click_icon_close() {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, null);
}

function handle_overlay_mousedown(event) {
  console.log('event handle_overlay_mousedown', event);
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, null);
}
// function handle_overlay_mousedown(event) {
//   console.log('event handle_overlay_mousedown', event);
//   // ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
//   // ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, null);
// }

function event_stop_propagation(event) {
  event.stopPropagation();
}

function handle_click_save(event) {
  // todo: continue: add zod form validatoin here
  let zod_object = props.model.dialog_data.zod_object as Zod.ZodObject<any>;
  let zod_result = zod_object.safeParse(props.model.dialog_data.form_state);
  if (zod_result.success === true) {
    ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
    ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, props.model.dialog_data.form_state);
  } else {
    model.zod_issues = zod_result.error.issues;
    console_log('props.model.dialog_data.form_state', props.model.dialog_data.form_state);
    console_log('zod_result', zod_result);
    console_log('zod_result.error', zod_result.error);
  }
  //
}
function handle_click_cancel(event) {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, null);
}
</script>

<template>
  <div
    ref="overlay_root"
    class="overlay overlay-form"
    :class="{
      active: props.model.dialog_status === 'active',
    }"
    :data-dialog_status="props.model.dialog_status"
    v-on:mousedown="handle_overlay_mousedown"
  >
    <div class="card" ref="overlay_inner" v-on:click="event_stop_propagation" v-on:mousedown="event_stop_propagation">
      <div class="overlay__header overlay-header">
        <h4 class="overlay-header__title" v-text="props.model.dialog_data.title"></h4>
        <div class="overlay-header__close" v-html="mdi_close" @click="handle_click_icon_close"></div>
      </div>
      <div class="overlay__content overlay-content">
        <div class="template-form">
          <Form :form_state="props.model.dialog_data.form_state" :form_fields="props.model.dialog_data.form_fields"></Form>

          <div class="issues" v-if="model.zod_issues.length > 0">
            <MessageSimpleLine
              v-for="issue in model.zod_issues"
              :model="{
                type: 'negative',
                text: issue.message,
              }"
            />
          </div>

          <div class="buttons">
            <Button
              v-on:button_click="handle_click_save"
              :model="{
                text: 'Save',
                color: 'primary',
              }"
            ></Button>
            <Button
              v-on:button_click="handle_click_cancel"
              :model="{
                text: 'Cancel',
                color: 'white',
              }"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.overlay-form {
  .message-simple-line {
    margin-bottom: 8px;
  }
}
</style>
