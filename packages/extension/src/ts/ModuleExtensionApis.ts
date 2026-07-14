export default class ModuleExtensionApis {
  storage_set(data) {
    return chrome.storage.local.set(data);
  }
  storage_get(data) {
    return chrome.storage.local.get(data);
  }
  storage_clear() {
    return chrome.storage.local.clear();
  }
  tabs_remove(id) {
    chrome.tabs.remove(id);
  }
  send_runtime_message(message) {
    chrome.runtime.sendMessage(message);
  }
  window_close() {
    window.close();
  }
  tabs_create() {}
  tabs_get(data) {
    return chrome.tabs.get(data);
  }
}
