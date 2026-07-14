import Popup from './ModulePopup';
import ModuleProjectContent from './ModuleProjectContent';
import ModuleTabStorage from './ModuleTabStorage';
import ModuleChromeStorage from './ModuleChromeStorage';
import ModuleCommonContent from './ModuleCommonContent';

export default class CtrlContent {
  popup: Popup;
  project: ModuleProjectContent;
  tab_storage: ModuleTabStorage;
  chrome_storage: ModuleChromeStorage;
  common: ModuleCommonContent;
  //
  iframe: HTMLIFrameElement;
  location_hostname: string;
  tab_id: number;
  // old content
  //
  constructor() {
    this.popup = new Popup();
    this.project = new ModuleProjectContent();
    this.tab_storage = new ModuleTabStorage();
    this.common = new ModuleCommonContent();
    this.chrome_storage = new ModuleChromeStorage();
  }
  async init() {
    // Init
    this.location_hostname = this.get_location_hostname();
    chrome.runtime.sendMessage({ name: 'purge_chrome_tab_storage' });
    //
    this.tab_id = await chrome.runtime.sendMessage({ name: 'get_tab_id' });
    console.log('tab_id', this.tab_id);
    await this.tab_storage.init(this.tab_id);
    await this.chrome_storage.init();
    console.log('tab_id', this.tab_id);
    //
    this.common.init();
    this.project.init();
    //
    // await this.popup.init();
    // this.popup.set_progress_status('not-active');
    // this.popup.toggle();
    //
  }
  // common
  get_location_hostname() {
    return window.location.hostname;
  }
  get_location_href() {
    return window.location.href;
  }
  get_page_html() {
    return document.body.outerHTML;
  }
}
