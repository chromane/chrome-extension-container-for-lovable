import fs_extra from 'fs-extra';
import dirnames from './dirnames.ts';

export default async function set_config_mode(mode: string) {
  let config = fs_extra.readJsonSync(dirnames.config);
  config.mode = mode;
  fs_extra.writeFileSync(
    //
    dirnames.config,
    JSON.stringify(config, null, 2)
  );
}
