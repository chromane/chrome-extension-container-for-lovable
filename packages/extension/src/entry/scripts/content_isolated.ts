import config from '@shared/config';
import proxies from '@src/ts/proxies';
import ctrl_content from '@src/ts/ctrl_content';
import { collapse_keys, decode_json, encode_json, html_to_element } from '@shared/ts/helpers';
import ctrl_frame from '@src/ts/ctrl_frame';
import ctrl_content_vue from '@src/ts/ctrl_content_vue';
//
// Font
// proxies.create_window_api(config.ext_id, ctrl_content, '*');
// proxies.create_window_api(config.ext_id, ctrl_frame, '*');

async function main() {
  // await ctrl_content_vue.init();
  // await ctrl_content.init();
  console.log('content_isolated.ts main()');
}
main();
