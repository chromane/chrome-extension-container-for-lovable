import { reactive, watch } from 'vue';
import get_anon_auth from './get_anon_auth';
import config from '@shared/config';
import { chrome_storage_default, ChromeStorage } from './storage';
import { AuthStore } from '@shared/types/types';
import { write_store_change } from '@shared/ts/helpers';
import { TabData } from '@shared/types/project';

// Object where the Vue app takes information for displaying data

export type VueStore = {
  [key: string]: any;

  // Common
  chrome_storage: ChromeStorage;
  auth: AuthStore;

  // Project
  tab_data: TabData;
  // profile_data: ProfileDataLinkedIn;
  // profile_data_mongo: ProfileDataMongo;
};

let store = reactive<VueStore>({
  example_response_txt: '',
  auth: get_anon_auth(),
  init_data: null,
  messages: [],
  // Chrome Storage
  // Assume this to always be synced up to the real chrome storage
  chrome_storage: chrome_storage_default,
  // User Interface General
  active_page_name: 'main',
  number_of_blocking_operations: 0,
  ui_title: config.ui_title,
  nav_icon: 'menu',
  // User Interface Components
  drawer_items: [],
  toasts: [],
  dialogs: [],
  // Project
  location_href: '',
  text_result: '',
  app_mode: 'normal',
  latest_customer_data: {},
  //
  tab_data: {},
  //
});

// In dev mode, watch for changes and log them
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

export default store;
