import console_log from '@shared/ts/console_log';
import { ProfileDataLinkedIn, ProfileDataMongo } from '@shared/types/project';
import { JwtClaims } from '@shared/types/common';
import { chrome_storage_default, ChromeStorage, storage_get } from './storage';

export default class ModuleChromeStorage {
  chrome_storage: ChromeStorage = chrome_storage_default;
  constructor() {}
  async init(new_chrome_storage_callback?: (chrome_storage: ChromeStorage) => void) {
    //
    chrome.storage.onChanged.addListener((changes) => {
      console_log('storage.changes', changes);
      let changes_occured = false;
      for (let storage_key in chrome_storage_default) {
        if (changes && changes[storage_key] && changes[storage_key].newValue) {
          changes_occured = true;
          this.chrome_storage[storage_key as keyof ChromeStorage] = changes[storage_key].newValue;
          console_log(`chrome_storage.${storage_key} updated`, this.chrome_storage[storage_key as keyof ChromeStorage]);
          break;
        }
      }
      if (changes_occured && new_chrome_storage_callback) {
        new_chrome_storage_callback(this.chrome_storage);
      }
    });
    //
    this.chrome_storage = await storage_get();
    return this.chrome_storage;
  }
  //
  //   async set(new_data: Partial<TabData>) {
  //     for (let key in new_data) {
  //       // @ts-ignore
  //       this.tab_data[key] = new_data[key];
  //     }
  //     console_log('set tab_data', this.tab_data);
  //     await chrome.storage.local.set({
  //       [this.storage_key]: this.tab_data,
  //     });
  //   }
  //   async get() {
  //     return this.tab_data;
  //   }
}
