import console_log from '@shared/ts/console_log';
import ctrl_frame from './ctrl_frame';
import { storage_set } from './storage';
import { clone, get_id } from '@shared/ts/helpers';

export default class ModuleProjectFrame {
  // todo: add typinghere
  profile_data = {} as any;
  //
  constructor() {}
  async init() {
    //
    let chrome_storage = await ctrl_frame.chrome_storage.init((chrome_storage) => {
      console_log('chrome_storage updated', chrome_storage);
      ctrl_frame.store.chrome_storage = clone(chrome_storage);
    });
    console_log('chrome_storage loaded', chrome_storage);
    ctrl_frame.store.chrome_storage = clone(chrome_storage);
    //
  }
  //
  latest_refresh_active_value = false;
  refresh_interval: any = 0;
  async handle_tab_data_update() {}
  show_notification() {}
  //
}
