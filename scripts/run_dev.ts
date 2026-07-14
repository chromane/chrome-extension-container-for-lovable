import spawn_process from './spawn_process.ts';
import dirnames from './dirnames.ts';
import set_config_mode from './set_config_mode.ts';

async function run_dev() {
  await set_config_mode('dev');
  await spawn_process('npm run dev', dirnames.extension);
}

run_dev();
