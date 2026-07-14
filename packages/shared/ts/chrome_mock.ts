import { decode_json, encode_json } from "@shared/ts/helpers";

export default {
  init(_window: any) {
    _window.chrome = {
      tabs: {
        create({ url }) {
          window.open(url);
        },
      },
      storage: {
        local: {
          async set(obj) {
            for (let key in obj) {
              localStorage.setItem(key, encode_json(obj[key]));
            }
          },
          async get(arr) {
            let storage = {};
            for (let key of arr) {
              storage[key] = decode_json(localStorage.getItem(key));
            }
            return storage;
          },
        },
      },
      runtime: {
        onMessage: (callback) => {},
      },
      i18n: {
        getUILanguage: () => {
          return "en-US";
        },
      },
      permissions: {
        getAll: () => {
          return {};
        },
      },
      scripting: {
        unregisterContentScripts: () => {},
        registerContentScripts: () => {},
      },
    };
  },
};
