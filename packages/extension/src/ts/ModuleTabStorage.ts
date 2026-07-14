import console_log from '@shared/ts/console_log';
import { TabData, tab_data_default } from '@shared/types/project';

export default class ModuleTabStorage {
  tab_id: number;
  storage_key: string;
  tab_data: TabData = tab_data_default;
  constructor() {}
  async init(tab_id: number, new_tab_data_callack?: (tab_data: TabData) => void) {
    //
    this.tab_id = tab_id;
    this.storage_key = `tab_data_${this.tab_id}`;
    //
    chrome.storage.onChanged.addListener((changes) => {
      console_log('storage.changes', changes);
      if (changes && changes[this.storage_key] && changes[this.storage_key].newValue) {
        this.tab_data = changes[this.storage_key].newValue;
        console_log('tab_data updated', this.tab_data);
        if (new_tab_data_callack) {
          new_tab_data_callack(this.tab_data);
        }
      }
    });
    //
    let storage = await chrome.storage.local.get(this.storage_key);
    this.tab_data = storage[this.storage_key] || tab_data_default;
    console_log('tab_data', this.tab_data);
    return this.tab_data;
  }
  //
  async set(new_data: Partial<TabData>) {
    for (let key in new_data) {
      // @ts-ignore
      this.tab_data[key] = new_data[key];
    }
    console_log('set tab_data', this.tab_data);
    await chrome.storage.local.set({
      [this.storage_key]: this.tab_data,
    });
  }
  async save() {
    await chrome.storage.local.set({
      [this.storage_key]: this.tab_data,
    });
  }
  async get() {
    return this.tab_data;
  }
}
