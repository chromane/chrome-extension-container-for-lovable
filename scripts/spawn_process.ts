import { exec, spawn, execSync } from 'child_process';

function spawn_process(command: string, cwd: string) {
  // cwd stands for "current working directory"
  // this allows us to run commands in different directories
  // spawn accepts first argument to be the name of the executable
  // second param - is the array of arguments
  return new Promise((resolve) => {
    let command_name = command.split(' ')[0];
    let command_args = command.split(' ').slice(1);
    let spawn_result = spawn(command_name, command_args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    //
    // console.log("spawn_result", spawn_result);
    spawn_result.addListener('close', (code) => {
      console.log('spawn close', code);
      resolve(code);
    });
  });
}

export default spawn_process;
