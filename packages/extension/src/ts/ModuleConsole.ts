import ctrl from '../ts/ctrl_admin';
import config from '@shared/config';
import { encode_url_state } from '@shared/ts/helpers';
import { RESPONSE_CODE } from '@shared/types/common';

export default class ModuleConsole {
  async handle_console_input(text) {
    console.log('handle_console_input', text);
    let items = text.split(' ');
    if (this[items[0]]) {
      this[items[0]].apply(this, items.slice(1));
    }
  }
  // methods
  async test() {
    let r = await ctrl.proxy_backend.test?.test();
    console.log(r);
  }
}
