import { watch } from 'vue';
import { clone, decode_jwt, decode_url_state, get_id } from '@shared/ts/helpers';
import ctrl_content from './ctrl_content';
import console_log from '@shared/ts/console_log';
//
import type ControllerServer from '@back/src/ts/ControllerServer';
import ModuleProjectFrame from './ModuleProjectFrame';
import ModuleToasts from './ModuleToasts';
import ModuleDrawer from './ModuleDrawer';
import proxies from './proxies';
import get_url from '@shared/get_url';
import ModuleAuth from './ModuleAuth';
import ModuleDialogs from './ModuleDialogs';

import ModuleExtensionApis from './ModuleExtensionApis';

import config from '@shared/config';
import get_anon_auth from './get_anon_auth';
import store from './store';
import ModuleTabStorage from './ModuleTabStorage';
import ModuleChromeStorage from './ModuleChromeStorage';
import { storage_get } from './storage';

class CtrlFrame {
  store = store;

  pages: any = [];
  window_name = '';
  //
  iframe_id = get_id();
  context = 'unknown';
  // proxies
  proxy_backend: ControllerServer;
  // modules
  proxy_extension_iframe: ModuleExtensionApis;
  auth: ModuleAuth;
  project: ModuleProjectFrame;
  toasts: ModuleToasts;
  drawer: ModuleDrawer;
  dialogs: ModuleDialogs;
  tab_storage: ModuleTabStorage;
  chrome_storage: ModuleChromeStorage;

  constructor() {
    this.proxy_extension_iframe = new ModuleExtensionApis();
    this.auth = new ModuleAuth();
    this.drawer = new ModuleDrawer();
    this.project = new ModuleProjectFrame();
    this.toasts = new ModuleToasts();
    this.dialogs = new ModuleDialogs();
    this.tab_storage = new ModuleTabStorage();
    this.chrome_storage = new ModuleChromeStorage();
    this.proxy_backend = proxies.create_proxy_backend<ControllerServer>(get_url('backend_root'));
  }
  location_href = '';
  tab_id: any;
  tab_info: any;
  async init() {
    //
    this.window_name = window.name;
    this.pages = [];
    this.location_href = location.href;
    this.drawer.init();
    //
    let chrome_storage = await storage_get();
    console_log('chrome_storage', chrome_storage);
    //
    // if (chrome_storage.auth && chrome_storage.auth.jwt_token) {
    //   this.store.auth = {
    //     jwt_token: chrome_storage.auth.jwt_token,
    //     jwt_claims: decode_jwt(chrome_storage.auth.jwt_token),
    //   };
    //   if (this.store.auth.jwt_claims.tags.includes('unlocked')) {
    //     this.store.active_page_name = 'main';
    //   } else if (this.store.auth.jwt_claims.roles.includes('anon')) {
    //     this.store.active_page_name = 'auth';
    //   } else {
    //     this.store.active_page_name = 'unlock';
    //   }
    // } else {
    //   this.store.active_page_name = 'auth';
    // }
    //
    // if (config.mode === 'dev') {
    // this.store.active_page_name = 'main';
    // }
    //
    if (this.location_href.includes('#sidepanel')) {
      //
      let tab_id = parseInt(this.location_href.split('#sidepanel-')[1]);
      console.log('tab_info', this.location_href, tab_id);
      this.tab_id = tab_id;
      this.tab_info = await this.proxy_extension_iframe.tabs_get(tab_id);
    }
    //
    this.project.init();
    this.watch_runtime();
    this.watch_vue();
    //
    // store.active_page_name = "main";
    // store.active_page_name = 'cancel_requests';
    //
    // store.number_of_blocking_operations = 0;
    //
    // this.blocking_inc();
    //
    //
  }
  async get_page_data() {
    let result = await chrome.tabs.sendMessage(this.tab_id, { name: 'get_page_data' });
    return result;
  }
  //
  latest_customer_id: '';

  async watch_runtime() {
    chrome.runtime.onMessage.addListener((message) => {
      this.handle_runtime_message_2(message);
    });
  }

  async handle_runtime_message_2(message: any) {
    if (message.name === 'redirect') {
      if (message.data.state) {
        let url_state_data: any = decode_url_state(message.data.state);
        console_log('url_state_data', url_state_data);
        if (url_state_data && url_state_data.iframe_id === this.iframe_id) {
          if (
            //
            url_state_data.event_name === 'payment_confirmation'
          ) {
            if (this.store.auth) {
              this.proxy_extension_iframe.send_runtime_message({ name: 'close_redirect_page' });
              this.proxy_extension_iframe.send_runtime_message({ name: 'focus_this_tab' });
              //
              this.blocking_inc();
              //
              await this.auth.refresh_jwt();

              this.toasts.show_toast({ text: 'Upgraded to AutoLister Pro Premium 🚀', type: 'success', title: 'Success' }, 10000);
              //
              this.blocking_dec();
              //
            }
          } else if (
            //
            url_state_data.event_name === 'stripe_portal_return' ||
            url_state_data.event_name === 'payment_cancel'
          ) {
            this.proxy_extension_iframe.send_runtime_message({ name: 'close_redirect_page' });
            this.proxy_extension_iframe.send_runtime_message({ name: 'focus_this_tab' });
          } else if (
            //
            url_state_data.flow_type === 'log_in'
          ) {
            this.auth.handle_google_code(message.data.code);
          }
        }
      }
    }
  }

  drawer_item_click(item: any) {
    console.log(item);
    if (item.name === 'help_desk') {
      chrome.tabs.create({ url: 'https://support.dealerwebsites.com/hc/en-us', active: true });
    } else if (item.name === 'logout' || item.name === 'log_out') {
      this.auth.log_out();
    } else {
      this.store.active_page_name = item.name;
    }
  }
  //
  async watch_vue() {
    watch(
      () => store.number_of_blocking_operations,
      async () => {
        if (this.context === 'content') {
          if (store.number_of_blocking_operations === 0) {
            // ctrl_content.popup.set_progress_status("not-active");
          } else {
            // ctrl_content.popup.set_progress_status("active");
          }
        }
      },
      {
        immediate: true,
      }
    );
    // watch(
    //   () => store.chrome_storage,
    //   () => {
    //     this.proxy_extension_iframe.storage_set(clone(store.chrome_storage));
    //   }
    // );
  }

  // todo: probably remove this method
  // too: define a type for the runtime message object
  async handle_runtime_message(message: any) {
    console.log('message', message);
    if (message.name === 'redirect') {
      let state = JSON.parse(atob(message.data.state)) as any;
      console.log('state', state);
      if (state.flow_type === 'log_in') {
        this.blocking_inc();
        this.proxy_extension_iframe.send_runtime_message({
          name: 'close_redirect_page',
        });
        if (this.location_href.includes('#sidepanel')) {
          this.proxy_extension_iframe.send_runtime_message({ name: 'focus_tab', data: { tab_id: this.tab_id } });
        } else {
          this.proxy_extension_iframe.send_runtime_message({ name: 'focus_this_tab' });
        } // let code = message.data.code;
        this.blocking_dec();
        // this.firebase_manager.sign_in_with_google_code(code);
      }
    }
  }

  goto(page_name: string) {
    console.log('page_name', page_name);
    store.active_page_name = page_name;
  }

  // vue_api
  async close_button_click() {
    // window.close();
    //
    if (location.hash === '#popup') {
      window.close();
    } else if (location.hash.includes('#sidepanel')) {
      window.close();
    } else {
      ctrl_content.popup.set_status('bubble');
    }
    // let location_href = await this.proxy_extension_iframe.get_location_href();
    // if (location_href === `chrome-extension://hllcidblpphifkfbjnaehpgejhpgichm/pages/iframe/index.html`) {
    //   // @ts-ignore
    //   this.proxy_content.close_popup_mode();
    // } else {
    //   this.proxy_extension_iframe.window_close();
    // }
  }
  handle_toggle(toggle: { name: string; value: any }) {
    // this.store.chrome_storage.settings[toggle.name] = toggle.value;
    // this.store.chrome_storage = clone(this.store.chrome_storage);
  }
  blocking_inc() {
    this.store.number_of_blocking_operations += 1;
  }
  blocking_dec() {
    this.store.number_of_blocking_operations -= 1;
  }
}

export default CtrlFrame;
