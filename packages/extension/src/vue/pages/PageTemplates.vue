<script setup lang="ts">
import mdi_remove from '@mdi/svg/svg/delete.svg?raw';
import mdi_edit from '@mdi/svg/svg/pencil.svg?raw';
import mdi_close from '@mdi/svg/svg/close.svg?raw';
import mdi_account from '@mdi/svg/svg/account-circle.svg?raw';
import mdi_duplicate from '@mdi/svg/svg/content-duplicate.svg?raw';

import Button from '@src/vue/comp/Button.vue';
import { computed, reactive } from 'vue';
import { get_id } from '@shared/ts/helpers';
import ctrl_frame from '@src/ts/ctrl_frame';
import console_log from '@shared/ts/console_log';

import zod from 'zod';

let model = reactive({
  template_arr: [
    {
      id: get_id(),
      title: 'Example title 1',
      description: 'Description example',
    },
    {
      id: get_id(),
      title: 'Example title 2',
      description: 'N/A',
    },
  ],
});

const show_create_templates_button = true;

let create_template_button = {
  text: 'Create new template',
  color: 'blue_2',
};

async function button_click() {
  //   store.ui_active_page_name = 'new_template';
  let dialog_result: any = await ctrl_frame.dialogs.open_dialog('form', {
    title: 'Edit output',
    zod_object: zod.object({}),
    form_state: {},
    form_fields: [
      //
      {
        name: 'output',
        title: 'Output',
        type: 'textarea',
      },
    ],
  });
  console_log('dialog_result', dialog_result);
}
function use(template) {}

function get_object_entries(obj) {
  return Object.entries(obj);
}

async function remove_item_callback(data) {
  const item_id = data.id;
  //   await app_controller.remove_template({ document_id: item_id });
}

async function edit_item_callback(data) {
  const form_state = data.form_state;

  //   await app_controller.edit_template({ form_state });
}

function handle_click_use_item(item, event: Event) {}
function handle_click_edit_item(id: string, event: Event) {}
function handle_click_duplicate_item(item) {}

function handle_click_remove_item(id: string, event: Event) {}

//
// store.user_data && store.user_data.status !== 'premium' && store.app_templates.length >= 3
</script>

<template>
  <div class="page templates-list">
    <div v-if="model.template_arr.length > 0">
      <div class="templates-list__header">
        <h5 class="templates-list__title">Templates</h5>
        <Button
          v-if="show_create_templates_button"
          class="templates-list__button"
          :model="{
            text: 'New template',
          }"
          v-on:button_click="button_click"
        ></Button>
      </div>
      <ul class="templates-list__items list-items">
        <li class="list-items__item list-item" v-for="item of model.template_arr">
          <ul class="list-item__sub-items sub-items">
            <li :class="['sub-items__item', `sub-items__item--${'info'}`, 'sub-item']">
              <div class="sub-item__wrapper">
                <span class="sub-item__value sub-item__value--title">{{ item.title }}</span>
                <span class="sub-item__label sub-item__value--description">{{ item.description }}</span>
              </div>
            </li>
            <li class="sub-items__item sub-items__item--controls sub-items__item--use sub-item">
              <button class="sub-item__button" @click="handle_click_use_item(item, $event)" title="Use this template">Use</button>
            </li>
            <li class="sub-items__item sub-items__item--edit sub-items__item--controls sub-item">
              <button
                v-tippy="'Edit'"
                @click="handle_click_edit_item(item.id, $event)"
                class="sub-item__button"
                v-html="mdi_edit"
                title="Edit"
              ></button>
            </li>
            <li class="sub-items__item sub-items__item--delete sub-items__item--controls sub-item">
              <button
                v-tippy="'Delete'"
                @click="handle_click_remove_item(item.id, $event)"
                class="sub-item__button"
                v-html="mdi_remove"
                title="Delete"
              ></button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.page.templates-list {
  background-color: #f0f0f0;
}
.templates-list__header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
}

.templates-list__items {
  background-color: white;
}

.templates-list__button {
  margin-left: 20px;
  max-width: 250px;
}

.templates-list__title {
  flex: 1 0 auto;
  font-size: 22px;
  font-weight: 700;
  color: #000711;
}

.sub-items__item--controls.sub-items__item--use button {
  padding: 10px 20px;
  border-radius: 4px;
  background-color: var(--color-primary);
  color: #fafafa;
  font-weight: 500;
  font-size: 14px;
}

.sub-items__item.sub-items__item--id {
  display: none;
}

.sub-items__item.sub-items__item--title {
  width: 150px;
  overflow: hidden;
  white-space: nowrap;
}

.sub-items__item--controls.sub-items__item--edit,
.sub-items__item--controls.sub-items__item--delete {
  margin-left: 4px;
}

.sub-items__item--controls.sub-items__item--edit {
  margin-left: 4px;
}

.sub-items__item--controls.sub-items__item--edit button,
.sub-items__item--controls.sub-items__item--delete button {
  width: 30px;
  height: 30px;
  padding: 5px;
}

.sub-items__item--controls.sub-items__item--edit svg,
.sub-items__item--controls.sub-items__item--delete svg {
  width: 100%;
  height: 100%;
  fill: #021635;
}

.list-items {
  display: flex;
  flex-direction: column;
  color: #010e22;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  overflow: hidden;
}

.sub-items {
  display: flex;
  align-items: flex-start;
}

.list-items__item {
  margin-bottom: 10px;
}

.sub-items__item--description {
  width: 100%;
}

.list-item {
  padding: 15px 20px;
}

.list-item:nth-child(2n) {
  background-color: rgba(185, 255, 182, 0.23);
}
.sub-items__item {
  margin-left: 25px;
  line-height: 140%;
}

.sub-items__item--info {
  width: 100%;
}

.sub-items__item:first-child {
  margin-left: 0;
}

.sub-item {
  display: flex;
  justify-content: flex-start;
}

.sub-item__wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.sub-item__value {
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: 500;
}

.sub-item__label {
  font-size: 14px;
  color: rgba(32, 32, 32, 0.8);
}
</style>
