import { JwtClaims } from '@shared/types/common';
import get_anon_auth from './get_anon_auth';

export type SupportedSite = {
  hostname: string;
};

type ExtensionSettings = {
  api_key: string;
};

export type ChromeStorage = {
  supported_sites: Array<SupportedSite>;
  settings: ExtensionSettings;
  auth: {
    jwt_token: string;
    jwt_claims: JwtClaims;
  };
  item_arr_to_autofill: any;
  item_arr_autofilled: Array<string>;
  feed_url: string;
  post_after_autofill: boolean;
  craigslist_listing?: any;
  latest_text: string;
};

let chrome_storage_default: ChromeStorage = {
  supported_sites: [],
  settings: {
    api_key: '',
  },
  auth: get_anon_auth(),
  item_arr_to_autofill: null,
  item_arr_autofilled: [],
  feed_url: '',
  post_after_autofill: false,
  craigslist_listing: null,
  latest_text: '',
};

export { chrome_storage_default };

export async function storage_get() {
  // init
  let chrome_storage: any = await chrome.storage.local.get(Object.keys(chrome_storage_default));
  // fill in defaults
  for (let key in chrome_storage_default) {
    if (chrome_storage[key] === undefined) {
      // @ts-ignore
      chrome_storage[key] = chrome_storage_default[key];
    }
  }
  // return
  return chrome_storage as ChromeStorage;
}

export async function storage_set(chrome_storage: Partial<ChromeStorage>) {
  await chrome.storage.local.set(chrome_storage);
}

export async function storage_get_jwt_token() {
  let chrome_storage: any = await chrome.storage.local.get('auth');
  if (chrome_storage && chrome_storage.auth && chrome_storage.auth.jwt_token) {
    return chrome_storage.auth.jwt_token;
  }
  return null;
}
