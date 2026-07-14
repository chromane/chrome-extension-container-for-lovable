import { encode_json } from '@shared/ts/helpers';

export default class ModuleCommon {
  constructor() {}
  async init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.name === 'get_page_data') {
        let page_data = encode_json({
          url: location.href,
          html: document.documentElement.outerHTML,
        });
        sendResponse(page_data);
      }
    });
  }
}
