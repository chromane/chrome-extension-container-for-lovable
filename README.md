# Chrome Extension Container for Lovable™

### Build

Run this command to build the extension into the `/temp_extension_build` folder

```bash
$ npm install
$ npm run build
```

### Dev

Launch Dev process that watches for changes and generates the `/temp_extension_install` folder with an installable extension

```bash
$ npm run dev
```

### Installing developer versions on Chrome

1. Go to your [Chrome Extension Tab](chrome://extensions/)

2. Make sure developer mode is enabled

3. Click "Load unpacked extension..." Be sure to select the entire folder containing the `manifest.json` file from `/extension` or `/dist` ( not `/src` )
