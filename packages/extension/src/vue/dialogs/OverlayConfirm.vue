<script setup lang="ts">
import { ref, watch, nextTick, reactive } from "vue";
import Button from "@src/vue/comp/Button.vue";
import { onMounted } from "vue";
import { wait } from "@shared/ts/helpers";
import ctrl_admin from "@src/ts/ctrl_frame";

const props = defineProps<{
  model: any;
}>();

let state = {
  resolver: (result: any) => {},
};

let model = reactive({
  active: false,
  //
  title: "",
  text: "",
  action_text: "",
});

const emit = defineEmits(["popup-close"]);

const popup_inner = ref(null);
const popup_root = ref(null);

function handle_click_icon_close() {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, false);
}

function handle_click_overlay(event) {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, false);
}

function handle_click_card(event) {
  event.stopPropagation();
}

function action_click() {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, true);
}

function cancel_click() {
  ctrl_admin.dialogs.close_dialog(props.model.dialog_id);
  ctrl_admin.dialogs.handle_dialog_result(props.model.dialog_id, false);
}
</script>

<template>
  <div
    class="overlay-confirm"
    :class="{
      overlay: true,
      active: props.model.dialog_status === 'active',
    }"
    :data-dialog_status="props.model.dialog_status"
    v-on:click="handle_click_overlay"
  >
    <div
      class="card"
      v-on:click="handle_click_card"
      style="padding: 24px"
    >
      <div class="page-confirm__text">
        <div
          class="page-confirm__title"
          v-text="props.model.dialog_data.title"
        ></div>
        <p
          class="page-confirm__subtitle whitespace-pre-line"
          v-text="props.model.dialog_data.text"
        ></p>
      </div>
      <div class="page-confirm__action">
        <Button
          :model="{
            text: props.model.dialog_data.action_text,
            color: 'red',
            fit_content: true,
          }"
          v-on:button_click="action_click"
        ></Button>
        <Button
          :model="{
            text: 'Cancel',
            color: 'white',
            fit_content: true,
          }"
          v-on:button_click="cancel_click"
        ></Button>
      </div>
    </div>
  </div>
</template>

<style>
.page-confirm {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.page-confirm__title {
  font-size: 22px;
  font-weight: 700;
  text-align: start;
  margin-bottom: 12px;
}

.page-confirm__action {
  align-self: flex-end;
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.page-confirm__action > * {
  margin-left: 10px;
}

.page-confirm__action > *:first-child {
  margin-left: 0;
}

.page-confirm__button {
  font-size: 14px;
  letter-spacing: inherit;
  font-family: inherit;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  color: #fafafa;
}

.page-confirm__button--danger {
  background-color: #f44336;
}

.page-confirm__button--cancel {
  background: none;
}

.page-confirm__button--cancel.page-confirm__button--danger {
  color: #f44336;
  border: 1px solid #f44336;
}

.title__main {
  margin-bottom: 10px;
  line-height: 140%;
  font-size: 24px;
  font-weight: 700;
}

.title__sub {
  font-size: 16px;
  line-height: 130%;
}
</style>
