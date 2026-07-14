import { clone, get_google_auth_url, decode_jwt } from '@shared/ts/helpers';
import get_url from '@shared/get_url';
import { RESPONSE_CODE } from '@shared/types/common';
import ctrl from '@src/ts/ctrl_frame';
import config from '@shared/config';
import logger from '@shared/ts/logger';
import console_log from '@shared/ts/console_log';
import get_anon_auth from './get_anon_auth';

export default class ModuleAuth {
  constructor() {}
  async trigger_sign_in_with_google() {
    let redirect_uri = get_url('google_auth_redirect_uri');
    //
    logger.log(123, config.mode);
    let scopes = [
      // general scopes
      'openid',
      'profile',
      'email',
    ];
    console.log(config.config_json.google_client_id, redirect_uri, 'google client id');
    let url = get_google_auth_url(config.config_json.google_client_id, redirect_uri, scopes, {
      iframe_id: ctrl.iframe_id,
      flow_type: 'log_in',
    });
    logger.log('url', url);
    let result = await chrome.tabs.create({
      active: true,
      url,
    });

    logger.log('result', result);
  }
  async handle_google_code(code: string) {
    ctrl.blocking_inc();
    ctrl.proxy_extension_iframe.send_runtime_message({ name: 'close_redirect_page' });
    if (ctrl.location_href.includes('#sidepanel')) {
      ctrl.proxy_extension_iframe.send_runtime_message({ name: 'focus_tab', data: { tab_id: ctrl.tab_id } });
    } else {
      ctrl.proxy_extension_iframe.send_runtime_message({ name: 'focus_this_tab' });
    }
    let result = await ctrl.proxy_backend.auth.sign_in_with_google_code(code, get_url('google_auth_redirect_uri'));
    if (result.code === RESPONSE_CODE.SUCCESS) {
      this.handle_auth_success(result.jwt_token);
    }
    ctrl.blocking_dec();
  }
  async handle_auth_success(jwt_token: string) {
    // todo: add onboarding steps here
    ctrl.blocking_inc();
    ctrl.store.auth = {
      jwt_token: jwt_token,
      jwt_claims: decode_jwt(jwt_token),
    };
    console_log('tags', ctrl.store.auth.jwt_claims.tags);
    ctrl.proxy_extension_iframe.storage_set({ auth: clone(ctrl.store.auth) });
    let result = await ctrl.proxy_backend.project.get_user_settings(ctrl.store.auth.jwt_token);
    if (result.code === RESPONSE_CODE.SUCCESS) {
      ctrl.store.user_settings = result.user_settings;
      if (ctrl.store.auth.jwt_claims.tags.includes('unlocked')) {
        ctrl.goto('account');
      } else {
        ctrl.goto('unlock');
      }
    } else {
      ctrl.goto('auth');
    }
    //
    ctrl.blocking_dec();
  }
  //
  log_out() {
    ctrl.store.auth = get_anon_auth();
    chrome.storage.local.set({
      auth: null,
    });
    ctrl.goto('auth');
  }

  async refresh_jwt_claims() {
    let result = await ctrl.proxy_backend.auth.jwt_refresh(ctrl.store.auth.jwt_token);
    if (result.code === RESPONSE_CODE.SUCCESS) {
      let jwt_token = result.jwt_token;
      ctrl.store.auth = {
        jwt_token: jwt_token,
        jwt_claims: decode_jwt(jwt_token),
      };
      ctrl.proxy_extension_iframe.storage_set({ auth: clone(ctrl.store.auth) });
    }
  }
  async refresh_jwt() {
    await ctrl.proxy_backend.auth.jwt_refresh(ctrl.store.auth?.jwt_token || '');
  }
  //
}
