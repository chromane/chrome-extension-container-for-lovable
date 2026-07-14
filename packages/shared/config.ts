// @ts-ignore
import config_json from './config.json';
import versions_json from './versions.json';
let mode = get_config_mode();
let { fb_id, extension_id, gc_id, ui_title, google_client_id } = config_json;
//

function get_config_mode() {
  return config_json.mode as 'prod' | 'dev' | 'test' | 'sandbox';
}

export default {
  ui_title,
  title: ui_title,
  mode,
  fb_id,
  ext_id: extension_id,
  extension_id,
  gc_id,
  config_json,
  versions_json,
  // this shoud be a getter because we change config.mode
  // dynamically during runtime to eanble test mode
  //
  google_client_id: google_client_id,
  google_cloud_oauth_client_id: google_client_id,
  // Sometimes, when we are working on tight timelines
  // And the client can't share access to a certain website
  // Loggin in production builds is usefull for debugging
  logging_in_prod: false,
  //
};
