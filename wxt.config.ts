import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  runner: {
    disabled: true,
  },
  manifest: {
    permissions: ['tabs'],
    web_accessible_resources: [
      {
        resources: ["injected.js"],
        matches: ["*://*.feishu.cn/*"],
      },
    ],
  },
});
