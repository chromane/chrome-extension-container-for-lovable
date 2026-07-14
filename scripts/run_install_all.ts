import spawn_process from './spawn_process.ts';
import dirnames from './dirnames.ts';

async function run_install_all() {
  await spawn_process('npm install', dirnames.shared);
  await spawn_process('npm install', dirnames.extension);
}

run_install_all();
