import * as rimraf from 'rimraf';
import path from 'path';
import fs_extra from 'fs-extra';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import fs from 'fs';
import sharp from 'sharp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
//
let _pr = path.resolve;
import dirnames from '../../../scripts/dirnames.ts';
// let dirnames = {
//   main: _pr("."),
//   root: _pr("."),
//   src: _pr(".", "src"),
//   package_chrome: _pr(".", "src", "package_chrome"),
//   temp_extension_webpack: _pr(".", "temp_extension_webpack"),
//   temp_extension_install: _pr(".", "temp_extension_install"),
//   temp_extension_build: _pr(".", "temp_extension_build"),
// };
//
async function compile(compiler: webpack.Compiler) {
  return new Promise((resolve) => {
    compiler.run((err: any, stats: any) => {
      if (stats.compilation && stats.compilation.errors) {
        console.log('stats.compilation.errors');
        stats.compilation.errors.forEach((error: any) => {
          console.log(error);
        });
      } else {
        console.log('stats.compilation.errors', []);
      }
      console.log('app err', err);
      compiler.close((closeErr) => {
        console.log('app closeErr', closeErr);
        resolve(0);
      });
    });
  });
}
function get_webpack_config(mode: string) {
  let webpack_data: any;
  let webpack_dev = {
    // devtool: "inline-source-map",
    // devtool: "nosources-source-map",
    // devtool: "source-map",
    devtool: 'inline-source-map',
    optimization: {
      minimize: false,
    },
  };
  let webpack_prod = {
    devtool: false,
    // devtool: "inline-source-map",
    optimization: {
      minimize: true,
    },
  };
  if (mode === 'prod') {
    webpack_data = webpack_prod;
    webpack_data.mode = 'production';
  } else if (mode === 'dev') {
    webpack_data = webpack_dev;
    webpack_data.mode = 'development';
    webpack_data.cache = { type: 'memory' };
  } else {
    return null;
  }
  webpack_data.resolve = {
    modules: [path.resolve('.', 'node_modules')],
    extensions: ['.ts', '.js', '.tsx', '.css', '.vue'],
    alias: {
      '@src': _pr(dirnames.extension, 'src'),
      '@shared': dirnames.shared,
      '@tests': dirnames.tests,
    },
  };
  webpack_data.module = {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /\.(css)$/,
        oneOf: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        exclude: /\.raw\./,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /\.raw\./,
      },
    ],
  };

  webpack_data.entry = {
    background: {
      import: './src/entry/scripts/background.ts',
      filename: './scripts/[name].js',
    },
    content_isolated: {
      import: './src/entry/scripts/content_isolated.ts',
      filename: './scripts/[name].js',
    },
    content_world_main: {
      import: './src/entry/scripts/content_world_main.ts',
      filename: './scripts/[name].js',
    },
    iframe: {
      import: './src/entry/iframe/main.ts',
      filename: './iframe/[name].js',
    },
    redirect: {
      import: './src/entry/redirect/main.ts',
      filename: './redirect/[name].js',
    },
    tab: {
      import: './src/entry/tab/main.ts',
      filename: './tab/[name].js',
    },
    tests: {
      import: './src/entry/tests/main.ts',
      filename: './tests/[name].js',
    },
  };

  webpack_data.plugins = [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }),
    new HtmlWebpackPlugin({
      template: _pr('.', 'src', 'entry', 'iframe', `index.html`),
      filename: `./iframe/index.html`,
      chunks: ['iframe'],
    }),
    new HtmlWebpackPlugin({
      template: _pr('.', 'src', 'entry', 'redirect', `index.html`),
      filename: `./redirect/index.html`,
      chunks: ['redirect'],
    }),
    new HtmlWebpackPlugin({
      template: _pr('.', 'src', 'entry', 'tab', `index.html`),
      filename: `./tab/index.html`,
      chunks: ['tab'],
    }),
    new HtmlWebpackPlugin({
      template: _pr('.', 'src', 'entry', 'tests', `index.html`),
      filename: `./tests/index.html`,
      chunks: ['tests'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ];
  return webpack_data;
}
async function create_dev_server() {
  let config = get_webpack_config('dev');
  console.log('entry', config.entry);

  fs_extra.ensureDirSync(dirnames.temp_extension_webpack);

  config.output = {
    path: dirnames.temp_extension_webpack + '/',
    publicPath: '/webpack/',
  };

  let compiler = webpack(config);
  let last_compilation_fullhash: any = '';

  compiler.hooks.afterEmit.tap('tapping', async (compilation) => {
    console.log('afterEmit');
    console.log('compilation', compilation.fullHash);
    if (last_compilation_fullhash !== compilation.fullHash) {
      last_compilation_fullhash = compilation.fullHash;
      try {
        await copy_compiled_css();
        await copy_from_temp_to_extension();
        await add_version_to_temp_extension();
        await add_key_to_temp_extension();
      } catch (e) {
        console.log('error', e);
      }
    }
  });

  compiler.hooks.afterCompile.tap('test', () => {
    console.log('afterCompile');
  });

  const devServerOptions = {
    devMiddleware: {
      writeToDisk: true,
      // path: _pr(".", "temp_extension_webpack"),
    },
    // magicHtml: false,
    webSocketServer: false,
    client: false,
    hot: false,
    liveReload: false,
    // inline: false,
    // injectClient: false,
    port: 2130,
    // don't open http://localhost:2130/ automatically on dev server start
    open: false,
    static: {
      directory: _pr('.', 'temp_extension_webpack'),
    },
  };

  const server = new WebpackDevServer(devServerOptions, compiler);

  console.log('Starting server...');
  await server.start();

  return server;
}
async function build_webpack() {
  // ensure
  rimraf.sync(dirnames.temp_extension_webpack);
  // build extension
  let config = get_webpack_config('prod');
  config.output = {
    path: dirnames.temp_extension_webpack + '/',
    publicPath: '/webpack/',
  };
  fs_extra.ensureDirSync(config.output.path);
  let compiler = webpack(config);
  await compile(compiler);
}
async function copy_from_temp_to_extension() {
  // clean temp_extension_install
  fs_extra.ensureDirSync(dirnames.temp_extension_install);
  rimraf.sync(dirnames.temp_extension_install);
  // copy raw /src/extension folder into installable /extension
  fs_extra.copySync(dirnames.package_chrome, dirnames.temp_extension_install);
  fs_extra.copySync(dirnames.temp_extension_webpack, _pr(dirnames.temp_extension_install, 'webpack'));
}
async function copy_compiled_css() {
  fs_extra.copySync(
    //
    _pr(dirnames.temp_extension_webpack, 'content_isolated.css'),
    _pr(dirnames.main, 'src', 'css', 'content_isolated_compiled.css')
  );
}

async function move_build_extension_to_root() {
  fs_extra.ensureDirSync(dirnames.temp_extension_build_root);
  rimraf.sync(dirnames.temp_extension_build_root);
  fs_extra.copySync(dirnames.temp_extension_build, dirnames.temp_extension_build_root);
}
function add_key_to_temp_extension() {
  let config = fs_extra.readJsonSync(_pr(dirnames.shared, 'config.json'));
  let manifest = fs_extra.readJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'));
  manifest.key = config.key;
  fs_extra.writeJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'), manifest, { spaces: 2 });
}
function add_version_to_temp_extension() {
  let versions = fs_extra.readJsonSync(_pr(dirnames.shared, 'versions.json'));
  let manifest = fs_extra.readJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'));
  manifest.version = versions.extension;
  fs_extra.writeJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'), manifest, { spaces: 2 });
}
function remove_key_from_temp_extension() {
  let manifest = fs_extra.readJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'));
  delete manifest.key;
  fs_extra.writeJsonSync(_pr(dirnames.temp_extension_install, 'manifest.json'), manifest, { spaces: 2 });
}
function zip_dir(input_dir: string, output_dir: string, output_file: string) {
  return new Promise((resolve) => {
    fs_extra.ensureDirSync(output_dir);

    var output = fs.createWriteStream(path.resolve(output_dir, output_file));
    var archive = new archiver.ZipArchive();

    output.on('close', function () {
      console.log(output_file);
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve(true);
    });

    archive.on('error', function (err: any) {
      console.log('archiver error', err);
      resolve(false);
    });

    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(input_dir, false);

    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory('subdir/', 'new-subdir');

    archive.finalize();
  });
}
async function build_logos() {
  let path_to_logo = _pr(dirnames.shared, 'slots', 'logo-main.svg');
  if (fs_extra.existsSync(path_to_logo)) {
    //
    let path_to_result_1 = _pr(dirnames.extension, 'src', 'package_chrome', 'img', 'logo-128.png');
    fs_extra.ensureDirSync(_pr(dirnames.extension, 'src', 'package_chrome', 'img'));
    await sharp(path_to_logo).resize(128, 128).png().toFile(path_to_result_1);
    //
    let path_to_result_2 = _pr(dirnames.extension, 'src', 'package_chrome', 'img', 'logo-16.png');
    fs_extra.ensureDirSync(_pr(dirnames.extension, 'src', 'package_chrome', 'img'));
    await sharp(path_to_logo).resize(16, 16).png().toFile(path_to_result_2);
    //
    let path_to_result_3 = _pr(dirnames.extension, 'src', 'package_chrome', 'img', 'logo-256.png');
    fs_extra.ensureDirSync(_pr(dirnames.extension, 'src', 'package_chrome', 'img'));
    await sharp(path_to_logo).resize(256, 256).png().toFile(path_to_result_3);
    //
  }
}

//
// todo: finalize this
async function run_dev() {
  try {
    rimraf.sync(`${dirnames.temp_extension_webpack}`);
    await create_dev_server();
  } catch (e) {
    console.log('Failed to start dev server');
    console.log(e);
  }
}
async function run_build() {
  let package_json = fs_extra.readJsonSync(_pr(dirnames.root, 'package.json'));
  let versions_json = fs_extra.readJsonSync(_pr(dirnames.shared, 'versions.json'));
  rimraf.sync(`${dirnames.temp_extension_webpack}`);
  await build_logos();
  await build_webpack();
  rimraf.sync(`${dirnames.temp_extension_build}`);
  fs_extra.ensureDirSync(dirnames.temp_extension_build);
  //
  await copy_compiled_css();
  await copy_from_temp_to_extension();
  await add_version_to_temp_extension();
  await remove_key_from_temp_extension();
  let package_no_key_name = `${package_json.name}-no-key-${versions_json.extension}.zip`;
  await zip_dir(dirnames.temp_extension_install, dirnames.temp_extension_build, package_no_key_name);
  //
  await copy_compiled_css();
  await copy_from_temp_to_extension();
  await add_version_to_temp_extension();
  await add_key_to_temp_extension();
  let package_key_name = `${package_json.name}-${versions_json.extension}.zip`;
  await zip_dir(dirnames.temp_extension_install, dirnames.temp_extension_build, package_key_name);
}

export { run_build, run_dev };
