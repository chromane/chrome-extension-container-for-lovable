<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { storage_get, storage_set } from '@src/ts/storage';
import ctrl_frame from '@src/ts/ctrl_frame';
import Form from '@src/vue/form/Form.vue';
import debouncer from '@shared/ts/debouncer';

let model = reactive({
  //
  form_state: {
    api_key: '',
  },
  form_fields: [
    {
      name: 'api_key',
      type: 'text',
      title: 'API Key',
      placeholder: 'Enter your API Key',
    },
  ],
  //
});

onMounted(async () => {
  let storage = await storage_get();
  if (storage.settings.api_key) {
    model.form_state.api_key = storage.settings.api_key;
  }
});
watch(
  () => model.form_state,
  async (new_val) => {
    if (model.form_state.api_key === ctrl_frame.store.chrome_storage.settings.api_key) {
      return;
    }
    let should_run_now = await debouncer.delay('save_settings', 100);
    if (!should_run_now) {
      return;
    }
    await storage_set({
      settings: {
        api_key: new_val.api_key,
      },
    });
    ctrl_frame.store.chrome_storage.settings = {
      api_key: new_val.api_key,
    };
    ctrl_frame.toasts.show_toast({
      type: 'success',
      title: 'Settings saved',
      text: 'Your settings have been saved successfully.',
    });
  },
  { deep: true }
);
//
</script>

<template>
  <div class="page active settings">
    <div class="page-inner active">
      <Form :form_state="model.form_state" :form_fields="model.form_fields"></Form>
    </div>
  </div>
</template>

<style>
.page.settings {
  width: 100%;
  .page-inner {
    width: 100%;
  }
  .chromane-checkbox {
    .title {
      margin-bottom: 4px;
    }
  }
}
.chromane-checkbox {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  opacity: 0.8;
  height: 32px;
  width: fit-content;

  font-size: 14px;
  font-weight: 500;
}
.chromane-checkbox:hover {
  opacity: 1;
}
.chromane-checkbox .svg {
  margin-right: 8px;
}
.chromane-checkbox svg {
  display: flex;
  width: 24px;
  height: 24px;
}
</style>
