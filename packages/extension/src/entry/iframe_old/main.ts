import '@src/css/tailwind.css';
import '@src/css/common.css';
import '@src/css/project.css';
// config
import config from '@shared/config';

if (location.hash === '#tab') {
  document.documentElement.classList.add('tab');
} else if (location.hash === '#popup') {
  document.documentElement.classList.add('popup');
} else if (location.hash.startsWith('#sidepanel')) {
  document.documentElement.classList.add('sidepanel');
}
// vue app
import App from '@src/vue/App.vue';
import { createApp } from 'vue';
import ctrl_frame from '@src/ts/ctrl_frame';
//
const app_vue = createApp(App);
// tippy
import VueTippy from 'vue-tippy';
import 'tippy.js/dist/tippy.css'; // optional for styling
import console_log from '@shared/ts/console_log';
import { collapse_keys } from '@shared/ts/helpers';
app_vue.use(VueTippy, {
  directive: 'tippy', // => v-tippy
});
//
app_vue.config.globalProperties.ctrl = ctrl_frame;
ctrl_frame.init();
app_vue.mount(document.querySelector('#vue-app-root'));
//
console.log('iframe');
