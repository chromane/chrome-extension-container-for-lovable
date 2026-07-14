import spawn_process from './spawn_process.ts';
import dirnames from './dirnames.ts';
import set_config_mode from './set_config_mode.ts';

async function run_build() {
  await set_config_mode('prod');
  await spawn_process('npm run build', dirnames.extension);
}

run_build();
