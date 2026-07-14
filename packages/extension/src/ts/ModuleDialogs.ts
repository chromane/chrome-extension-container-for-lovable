import config from '@shared/config';
import { decode_json, decode_jwt, encode_url_state, get_id, wait, write_store_change } from '@shared/ts/helpers';
import { RESPONSE_CODE } from '@shared/types/common';
import { getCurrentInstance, nextTick, onMounted, reactive, watch } from 'vue';

let store = reactive({
  dialog_arr: [] as Array<any>,
});

if (config.mode === 'dev') {
  Object.keys(store).forEach((key) => {
    watch(
      () => store[key],
      (v_new, v_old) => {
        write_store_change(key, v_new, v_old);
      },
      { deep: true }
    );
  });
}

export default class ModuleDialogs {
  // data
  resolvers: Record<string, Function> = {};
  store = store;
  // init
  constructor() {}
  async init() {}
  // This will be called from anywhere a dialog result is required
  open_dialog(dialog_name, dialog_data) {
    return new Promise(async (resolve) => {
      let dialog_id = get_id();
      this.resolvers[dialog_id] = resolve;
      let dialog_model = reactive({
        dialog_id,
        dialog_name,
        dialog_status: 'showing',
        dialog_data,
      });
      store.dialog_arr.push(dialog_model);
      await nextTick();
      await wait(10);
      dialog_model.dialog_status = 'active';
      //
      console.log('dialog_model', dialog_model);
    });
  }
  // This will be called from the Dialogs component
  handle_dialog_result(dialog_id: string, result: any) {
    let resolver = this.resolvers[dialog_id];
    if (resolver) {
      resolver(result);
    }
  }
  async close_dialog(dialog_id: string) {
    let dialog = store.dialog_arr.find((item) => {
      return item.dialog_id === dialog_id;
    });
    dialog.dialog_status = 'closing';
    await nextTick();
    await wait(310);
    for (let i = store.dialog_arr.length; i--; ) {
      if (store.dialog_arr[i].dialog_id === dialog_id) {
        store.dialog_arr.splice(i, 1);
      }
    }
  }
  //
}
