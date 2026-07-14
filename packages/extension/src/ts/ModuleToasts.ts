import { reactive, watch } from 'vue';
import config from '@shared/config';
import { get_id, wait } from '@shared/ts/helpers';
import ctrl from './ctrl_frame';

export default class ModuleToasts {
  constructor() {}
  async show_toast(message: { type: 'error' | 'negative' | 'info' | 'warning' | 'success'; title?: string; text: string }, delay: number = 2500) {
    let id = get_id();
    ctrl.store.toasts.push({
      id,
      message,
    });
    await wait(delay);
    this.close_toast(id);
  }
  close_toast(toast_id: string) {
    for (let i = 0; i < ctrl.store.toasts.length; i++) {
      let toast = ctrl.store.toasts[i];
      if (toast.id === toast_id) {
        ctrl.store.toasts.splice(i, 1);
      }
    }
  }
}
