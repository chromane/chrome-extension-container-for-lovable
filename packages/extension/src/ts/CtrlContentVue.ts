// todo: bugfix: sometimes popup covers other components
// todo: feature: update popup on window resize
let popup_html = `
<div class="chromane-container chromane-status-hidden">
  <div class="chromane-popup-content">
    <div id="content-vue-app-root"></div>
  </div>
</div>
`;
let popup_css = `

`;
import project_css from '@src/css/project.css?raw';
import content_css from '@src/css/content.css?raw';
//
import { clone, get_id, html_to_element, wait } from '@shared/ts/helpers';
// todo: improve the logic of importing this css
// import content_isolated_css_raw from "../../temp_extension_webpack/content_isolated.css?raw";
//
// vue app
import App from '@src/vue/AppContent.vue';
import { createApp, reactive } from 'vue';

//
let store = reactive({
  number_of_blocking_operations: 0,
  toasts: [],
});
export default class ContentVue {
  // store
  store = store;
  constructor() {}
  storage: any;
  shadow: any;
  async init() {
    //
    //
    //
    // this.set_status(storage.popup.status);
    // this.rect_set_apply(storage.popup.rect);
    //
    console.log('ts123', Date.now());
    let content_isolated_css_raw_response = await fetch(chrome.runtime.getURL('/webpack/content_isolated.css'));
    let content_isolated_css_raw = await content_isolated_css_raw_response.text();
    console.log('ts123', Date.now());
    //
    let style = html_to_element(
      `<style class = 'chromane-style' >
        ${popup_css}
        ${project_css}
        ${content_css}
        ${content_isolated_css_raw}
      </style>`
    );
    // document.documentElement.prepend(style);
    //
    this.overlay = html_to_element(`<div class = "chromane-overlay chromane-not-active" ></div>`) as HTMLElement;
    // document.documentElement.prepend(this.overlay);
    //
    this.container = html_to_element(popup_html);
    //
    const app_vue = createApp(App);
    app_vue.config.globalProperties.ctrl = this;
    app_vue.mount(this.container.querySelector('#content-vue-app-root'));
    //
    const host = html_to_element(`<div class = "chromane-shadow-root-host ctrl-content-vue" ></div>`) as HTMLElement;
    // host.style.setProperty('all', 'unset', 'important');
    // host.style.setProperty('white-space', 'normal', 'important');
    //
    const shadow = host.attachShadow({ mode: 'open' });
    this.shadow = shadow;
    shadow.appendChild(this.container);
    shadow.appendChild(style);
    shadow.appendChild(this.overlay);
    document.documentElement.prepend(host);
    //
  }
  //
  async show_toast(message) {
    let toast_id = get_id();
    this.store.toasts.push({
      id: toast_id,
      message,
    });
    await wait(2450);
    // await wait(22_22_450);
    this.close_toast(toast_id);
  }
  close_toast(toast_id) {
    for (let i = this.store.toasts.length; i--; ) {
      if (this.store.toasts[i].id === toast_id) {
        this.store.toasts.splice(i, 1);
      }
    }
  }
  //
  blocking_inc() {
    this.store.number_of_blocking_operations += 1;
  }
  blocking_dec() {
    this.store.number_of_blocking_operations -= 1;
  }
  //
  overlay: HTMLElement | null = null;
  popup: HTMLElement | null = null;
  popup_iframe: HTMLElement | null = null;
  button_left: number | null = null;
  button_top: number | null = null;
  iframe: HTMLIFrameElement | null = null;
  container: any;
}
