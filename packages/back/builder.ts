//
import nodeExternals from 'webpack-node-externals';
import { exec, spawn, execSync } from 'child_process';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import fs_extra from 'fs-extra';
import webpack from 'webpack';
import kill from 'tree-kill';
//
let _pr = path.resolve;
let _server_process: any = null;
import dirnames from '../../scripts/dirnames.ts';
console.log('dirnames', dirnames);
//
async function compiler_callback(mode, err, stats) {
  console.log('err', err);
  //
  if (mode === 'dev') {
    if (_server_process !== null) {
      kill(_server_process.pid);
      console.log('New version of back created. Process with old server killed.');
    }
    _server_process = spawn(`node`, `--env-file=.env ./packages/back/temp_back/main.cjs`.split(' '), {
      cwd: dirnames.root,
      stdio: 'inherit',
      shell: true,
    });
  }
  //
  if (stats && stats.compilation && stats.compilation.errors) {
    console.log('stats.compilation.errors');
    stats.compilation.errors.forEach((error) => {
      console.log(error);
    });
  } else {
    console.log('stats.compilation.errors', []);
  }
  console.log('app err', err);
}
function get_entry_obj() {
  var entry_names = fs.readdirSync(_pr(dirnames.back, 'src', 'entry')).map((name) => {
    return name.replace('.ts', '');
  });
  let entry_obj = {};
  for (let name of entry_names) {
    entry_obj[name] = path.resolve(dirnames.back, 'src', 'entry', `${name}.ts`);
  }
  return entry_obj;
}
function backend_get_config(mode) {
  let config_json = fs_extra.readJsonSync(dirnames.config);
  let config = {
    resolve: {
      extensions: ['.ts'],
      alias: {
        '@shared': dirnames.shared,
        '@back': dirnames.back,
        '@src': _pr(dirnames.back, 'src'),
        '@root': dirnames.root,
      },
    },
    entry: get_entry_obj(),
    module: {
      rules: [
        {
          resourceQuery: /raw/,
          type: 'asset/source',
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    // node-specific
    target: 'node',
    externals: [
      nodeExternals(),
      nodeExternals({
        modulesDir: path.resolve(dirnames.root, 'node_modules'),
      }),
    ], // in order to ignore all modules in node_modules folder
    externalsPresets: {
      node: true, // in order to ignore built-in modules like path, fs, etc.
    },
    // node-specific
    output: {
      filename: '[name].cjs',
      path: path.resolve(dirnames.back, 'temp_back'),
      libraryTarget: 'this', // <-- Important
      // publicPath: "./",
    },
  };
  config.plugins = [
    new webpack.DefinePlugin({
      CHROMANE_CONFIG_JSON: JSON.stringify(config_json),
      CHROMANE_PRJ: JSON.stringify('backend'),
    }),
  ];
  if (mode === 'dev') {
    config.mode = 'development';
    config.watch = true;
  } else {
    config.mode = 'production';
    config.watch = false;
  }
  return config;
}
async function run_dev() {
  let config = backend_get_config('dev');
  webpack(config, (err, stats) => {
    compiler_callback('dev', err, stats);
  });
}
async function run_build() {
  let config = backend_get_config('prod');
  webpack(config, (err, stats) => {
    compiler_callback('prod', err, stats);
  });
}
// main
let [arg_1, arg_2, arg_3] = process.argv.slice(2);
//
console.log('arg_1', arg_1);
console.log('arg_2', arg_2);
console.log('arg_3', arg_3);
//
async function main() {
  if (arg_1 === 'dev') {
    run_dev();
  } else if (arg_1 === 'build') {
    run_build();
  }
}

main();
