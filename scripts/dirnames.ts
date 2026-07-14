import path from 'path';
import fs_extra from 'fs-extra';
let _pr = path.resolve;

// find root package.json
let root = '.';
let path_arr = [
  //
  _pr('.'),
  _pr('..'),
  _pr('..', '..'),
  _pr('..', '..', '..'),
  _pr('..', '..', '..', '..'),
];
for (let path of path_arr) {
  try {
    let package_json = fs_extra.readJsonSync(_pr(path, 'package.json'));
    if (package_json.name === 'chrome-extension-container-for-lovable') {
      root = path;
    }
  } catch (e) {}
}

console.log('root', root);

let dirnames = {
  // root
  root: root,
  // packages
  back: _pr(root, 'packages', 'back'),
  builder: _pr(root, 'packages', 'builder'),
  ext: _pr(root, 'packages', 'extension'),
  browser: _pr(root, 'packages', 'browser'),
  extension: _pr(root, 'packages', 'extension'),
  package_chrome: _pr(root, 'packages', 'extension', 'src', 'package_chrome'),
  main: _pr(root, 'packages', 'extension'),
  front: _pr(root, 'packages', 'front'),
  shared: _pr(root, 'packages', 'shared'),
  tests: _pr(root, 'packages', 'tests'),
  website: _pr(root, 'packages', 'website'),
  //
  temp_extension_webpack: _pr(root, 'packages', 'extension', 'temp_extension_webpack'),
  temp_extension_build: _pr(root, 'packages', 'extension', 'temp_extension_build'),
  temp_extension_build_root: _pr(root, 'temp_extension_build'),
  temp_extension_install: _pr(root, 'packages', 'extension', 'temp_extension_install'),
  temp_extension_install_root: _pr(root, 'temp_extension_install'),
  // files
  config: _pr(root, 'packages', 'shared', 'config.json'),
  versions: _pr(root, 'packages', 'shared', 'versions.json'),
};
//
export default dirnames;
