import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons',],
  webExt: {
    disabled: true,
  },
  manifest: {
    permissions: ['tabs', "contextMenus",],
  },
  autoIcons: {
    grayscaleOnDevelopment: false,
  },
});
