<script setup lang="ts">
import { onMounted } from 'vue';
import ctrl_frame from '@src/ts/ctrl_frame';
import { reactive } from 'vue';
import NameValues from '../comp/NameValues.vue';
import Button from '../comp/Button.vue';
import console_log from '@shared/ts/console_log';
import { supported_site } from '@shared/types/zod_objects';
import { clone, wait, arr_remove_items } from '@shared/ts/helpers';
import { ChromeStorage, chrome_storage_default, storage_get, storage_set } from '@src/ts/storage';
import { get_id } from '@shared/ts/helpers';
//
let model = reactive<{
  chrome_storage: ChromeStorage;
}>({
  chrome_storage: chrome_storage_default,
});

onMounted(async () => {
  ctrl_frame.blocking_inc();
  model.chrome_storage = await storage_get();
  ctrl_frame.blocking_dec();
});

let form_fields = {
  hostname: {
    name: 'hostname',
    title: 'hostname',
    type: 'text',
  },
  image_selector: {
    name: 'image_selector',
    title: 'image_selector',
    type: 'text',
  },
  // selector_image: {
  //   name: 'selector_image',
  //   title: 'selector_image',
  //   type: 'text',
  // },
  // selector_cart_button: {
  //   name: 'selector_cart_button',
  //   title: 'selector_cart_button',
  //   type: 'text',
  // },
  _id: {
    name: '_id',
    title: '_id',
    type: 'text_readonly',
  },
  // distance: {
  //   name: "distance",
  //   title: "Distance",
  //   type: "select",
  //   options: ["Miles", "Kilometers"].map((value) => {
  //     return { name: value, title: value, value };
  //   }),
  // },
  // listing_description: {
  //   name: "listing_description",
  //   title: "Listing description",
  //   type: "textarea",
  // },
  // enable_ai_description: {
  //   name: "enable_ai_description",
  //   title: "Enable AI description",
  //   description: "Enable this toggle and Auto Lister Pro will use AI to generate a description for this advert.",
  //   type: "toggle",
  //   hide_label: true,
  //   no_padding: true,
  // },
  // ai_instructions: {
  //   name: "ai_instructions",
  //   title: "AI instructions",
  //   type: "textarea",
  // },
  // include_stock_number: {
  //   name: "include_stock_number",
  //   title: "Include stock number",
  //   description: "Enable this toggle and Auto Lister Pro will include vehicle's stock number at the bottom of advert description.",
  //   type: "toggle",
  //   hide_label: true,
  //   no_padding: true,
  // },
};
//
async function handle_item_create() {
  let dialog_result = await ctrl_frame.dialogs.open_dialog('site_create', {
    title: 'Add new supported site',
    zod_object: supported_site,
    form_state: {
      _id: get_id(),
    },
    form_fields: [
      //
      form_fields.hostname,
      form_fields.image_selector,
      form_fields._id,
    ],
  });
  console_log('dialog_result', dialog_result);
  if (dialog_result) {
    ctrl_frame.blocking_inc();
    await wait(350);
    // @ts-ignore
    model.chrome_storage.supported_sites.push(dialog_result);
    await storage_set(clone(model.chrome_storage));
    //
    ctrl_frame.blocking_dec();
  }
}
async function handle_item_edit(item) {
  let dialog_result = await ctrl_frame.dialogs.open_dialog('site_edit', {
    title: 'Edit supported site',
    zod_object: supported_site,
    form_state: clone(item),
    form_fields: [
      //
      form_fields.hostname,
      form_fields.image_selector,
      form_fields._id,
    ],
  });
  console_log('dialog_result', dialog_result);
  if (dialog_result) {
    // ctrl_frame.blocking_inc();
    // await wait(350);
    // model.chrome_storage.supported_sites = arr_remove_items(model.chrome_storage.supported_sites);
    // let back_result = await ctrl_frame.proxy_backend.admin.supported_sites_edit(ctrl_frame.store.auth.jwt_token, dialog_result);
    // //
    // let result = await ctrl_frame.proxy_backend.admin.supported_sites_get_all(ctrl_frame.store.auth.jwt_token);
    // if (result.supported_sites) {
    //   model.supported_sites = result.supported_sites;
    // }
    // //
    ctrl_frame.blocking_dec();
  }
}
async function handle_item_delete(item) {
  let dialog_result = await ctrl_frame.dialogs.open_dialog('site_delete', {
    title: 'Delete supported site',
    text: "Are you sure? This action can't be undone.",
    action_text: 'Delete',
  });
  console_log('dialog_result', dialog_result);
  if (dialog_result) {
    ctrl_frame.blocking_inc();
    //
    await wait(350);
    model.chrome_storage.supported_sites = arr_remove_items(model.chrome_storage.supported_sites, '_id', item._id);
    await storage_set(clone(model.chrome_storage));
    //
    ctrl_frame.blocking_dec();
  }
}
//
</script>

<template>
  <div class="page settings">
    <div class="page-inner">
      <div class="flex justify-between">
        <h1>Supported sites</h1>
        <Button
          :model="{
            text: 'Add new site',
          }"
          v-on:button_click="handle_item_create()"
        ></Button>
      </div>
      <div class="site-container">
        <div class="site-container-item" v-for="site in model.chrome_storage.supported_sites">
          <NameValues :model="site"></NameValues>
          <div class="buttons-h">
            <Button
              :model="{
                text: 'Edit',
              }"
              v-on:button_click="handle_item_edit(site)"
            ></Button>
            <Button
              :model="{
                color: 'red',
                text: 'Delete',
              }"
              v-on:button_click="handle_item_delete(site)"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.page.settings {
  h1 {
    margin-bottom: 24px;
    font-size: 24px;
    color: var(--color-h1);
  }
}
.site-container {
  .site-container-item {
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
    .name-value-cont {
      margin-bottom: 12px;
    }
  }
}
</style>
