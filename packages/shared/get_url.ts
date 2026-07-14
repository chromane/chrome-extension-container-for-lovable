import config_json from './config.json';
import versions_json from './versions.json';
import config from './config';

// for installing extension locally
let urls_dev = {
  backend_root: `http://localhost:8080/back`,
  google_auth_redirect_uri: `http://localhost:8080/back/auth-redirect`,
};
//
let urls_prod = {
  backend_root: `https://chromane.com/back`,
  google_auth_redirect_uri: `https://chromane.com/back/auth-redirect`,
};

type Urls = typeof urls_dev;

let urls = {
  dev: urls_dev as Urls,
  prod: urls_prod as Urls,
};

export default function get_url(url_name: keyof Urls) {
  return urls[config.mode][url_name];
}
