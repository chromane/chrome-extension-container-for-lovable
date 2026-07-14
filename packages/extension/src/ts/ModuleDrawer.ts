import ctrl from './ctrl_frame';
//
import mdi_home from '@mdi/svg/svg/home.svg?raw';
import mdi_peace from '@mdi/svg/svg/peace.svg?raw';
import mdi_cog from '@mdi/svg/svg/cog.svg?raw';
import mdi_comment from '@mdi/svg/svg/comment-quote-outline.svg?raw';
import mdi_tune from '@mdi/svg/svg/tune.svg?raw';
import mdi_debugger from '@mdi/svg/svg/server-network.svg?raw';
import mdi_testing from '@mdi/svg/svg/flask-outline.svg?raw';
import mdi_airplane_cog from '@mdi/svg/svg/airplane-cog.svg?raw';
import mdi_account from '@mdi/svg/svg/account-circle.svg?raw';
import mdi_contacts from '@mdi/svg/svg/contacts.svg?raw';
import mdi_templates from '@mdi/svg/svg/book-open-variant.svg?raw';
import mdi_crown from '@mdi/svg/svg/crown.svg?raw';
import mdi_finance from '@mdi/svg/svg/finance.svg?raw';
import mdi_star_circle from '@mdi/svg/svg/star-circle.svg?raw';
import mdi_sign_in from '@mdi/svg/svg/login-variant.svg?raw';
import mdi_log_out from '@mdi/svg/svg/logout-variant.svg?raw';
import mdi_table from '@mdi/svg/svg/table.svg?raw';
import mdi_cog_pause from '@mdi/svg/svg/cog-pause.svg?raw';
import mdi_cog_play from '@mdi/svg/svg/cog-play.svg?raw';
import mdi_email from '@mdi/svg/svg/at.svg?raw';
import mdi_script from '@mdi/svg/svg/script-text.svg?raw';
import mdi_list from '@mdi/svg/svg/format-list-bulleted.svg?raw';
import mdi_graph from '@mdi/svg/svg/graph.svg?raw';
import mdi_help_desk from '@mdi/svg/svg/face-agent.svg?raw';
//
import mdi_local_facebook from '@src/svg/facebook.svg?raw';
//
import { watch } from 'vue';
import console_log from '@shared/ts/console_log';
//
export default class ModuleDrawer {
  items_hash: any = {};
  constructor() {}
  init() {
    let items = [
      // Pages
      ['main', 'Main', mdi_home],
      ['main_old', 'Main Original', mdi_home],
      ['craigslist', 'Craigslist', mdi_peace],
      ['email_finder', 'Email finder', mdi_email],
      ['message_generator', 'Message generator', mdi_script],
      ['follow_up_list', 'Follow-up list', mdi_list],
      ['auth', 'Sign in', mdi_sign_in],
      ['account', 'My account', mdi_account],
      ['contacts', 'Contacts', mdi_contacts],
      ['templates', 'Templates', mdi_templates],
      ['upgrade', 'Upgrade', mdi_star_circle],
      ['admin', 'Admin', mdi_crown],
      ['analytics', 'Analytics', mdi_finance],
      ['debugger', 'Debugger', mdi_debugger],
      ['unlock', 'Unlock', mdi_cog],
      ['settings', 'Settings', mdi_cog],
      ['feedback', 'Feedback', mdi_comment],
      ['remote_config', 'Remote config', mdi_airplane_cog],
      ['model_tuning', 'Model tuning', mdi_tune],
      ['company_intel', 'Company intel', mdi_graph],
      // Testing
      ['testing', 'Testing', mdi_testing],
      // Functions
      ['log_out', 'Log out', mdi_log_out],
      ['help_desk', 'Help desk', mdi_help_desk],
      //
    ];
    ctrl.store.drawer_items = items.map((item) => {
      let [name, title, icon, hint] = item;
      this.items_hash[name] = { name, title, icon, hint };
      return { name, title, icon, hint };
    });
    // watch
    this.watch_vue();
  }
  async watch_vue() {
    watch(
      () => ctrl.store.auth,
      () => {
        console_log('ctrl.store.auth', ctrl.store.auth);
        if (ctrl.store.auth.jwt_claims.tags.includes('anon')) {
          ctrl.store.drawer_items = [
            //
            this.items_hash.main,
            this.items_hash.main_old,
            this.items_hash.settings,
            this.items_hash.debugger,
            //
            // this.items_hash.craigslist,
            // this.items_hash.help_desk,
            // this.items_hash.testing,
            //
          ];
        }
      },
      {
        immediate: true,
      }
    );
  }
}
