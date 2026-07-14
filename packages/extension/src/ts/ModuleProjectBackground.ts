import console_log from '@shared/ts/console_log';
import { blob_to_base64, decode_json, encode_json, obj_to_param_str, url_to_params } from '@shared/ts/helpers';

export default class ModuleProjectBackground {
  constructor() {}
  async init() {
    //
    chrome.runtime.onMessage.addListener((message, sender, send_response) => {
      console_log('runtime_message', message, sender);
      this.handle_runtime_message(message, sender)
        .then((result) => {
          // console_log(message.name + ' promise result', result);
          send_response(result);
        })
        .catch((error) => {
          console.log('Runtime message error', error);
          send_response(null);
        });
      console_log(message.name + ' handled');
      return true;
    });
    chrome.action.onClicked.addListener(async (tab) => {
      chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: `webpack/iframe/index.html#sidepanel-${tab.id}`,
      });
      chrome.sidePanel.open({
        tabId: tab.id,
        // path: "pages/iframe/index.html#sidepanel",
      });
    });
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        chrome.tabs.create({
          url: chrome.runtime.getURL('webpack/iframe/index.html#tab'),
          active: true,
        });
      }
      // Reload related pages on install or update
      if (details.reason === 'install' || details.reason === 'update') {
        chrome.tabs.query({ url: ['https://*.dialpad.com/*'] }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.url && tab.url.startsWith('http')) {
              chrome.tabs.reload(tab.id);
            }
          });
        });
      }
    });
  }
  async handle_runtime_message(message: any, sender: any) {
    //
    if (message.name === 'open_side_panel') {
      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: `webpack/iframe/index.html#sidepanel-${sender.tab.id}`,
      });
      chrome.sidePanel.open({
        tabId: sender.tab.id,
        // path: "pages/iframe/index.html#sidepanel",
      });
    } else if (message.name === 'open_tab') {
      chrome.tabs.create({
        url: chrome.runtime.getURL('webpack/tab/index.html#tab'),
        active: true,
      });
    } else if (message.name === 'open_url') {
      chrome.tabs.create({
        url: message.data.url,
        active: true,
      });
    } else if (message.name === 'tabs_create') {
      chrome.tabs.create(message.data);
    } else if (message.name === 'tabs_update') {
      chrome.tabs.update(sender.tab.id, message.data);
    } else if (message.name === 'tabs.captureVisibleTab') {
      let url = await chrome.tabs.captureVisibleTab(message.data);
      return url;
    } else if (message.name === 'close_this_tab') {
      chrome.tabs.remove(sender.tab.id);
    } else if (message.name === 'focus_this_tab') {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.update(sender.tab.id, {
          active: true,
        });
      }
    } else if (message.name === 'focus_tab') {
      chrome.tabs.update(parseInt(message.data.tab_id), {
        active: true,
      });
      return 200;
    } else if (message.name === 'get_tab_id') {
      return sender.tab.id;
    } else if (message.name === 'purge_chrome_tab_storage') {
      let keys = await chrome.storage.local.getKeys();
      let tabs = await chrome.tabs.query({});
      let tab_storage_keys = tabs.map((tab) => `tab_data_${tab.id}`);
      let keys_to_delete = keys.filter((key) => {
        return key.startsWith('tab_data_') && tab_storage_keys.includes(key) === false;
      });
      await chrome.storage.local.remove(keys_to_delete);
      return { deleted_keys: keys_to_delete };
    } else if (message.name === 'fetch_image_as_base64') {
      let response = await fetch(message.data.url);
      let blob = await response.blob();
      return await blob_to_base64(blob);
    }
  }
  //
}
