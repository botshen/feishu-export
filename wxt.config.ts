import { defineConfig } from 'wxt';
import Tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons',],
  webExt: {
    disabled: true,
  },
  manifest: {
    permissions: ["contextMenus"],
    host_permissions: [
      "https://*.feishu.cn/*",
      "https://*.feishu.net/*",
      "https://*.larksuite.com/*",
      "https://*.feishu-pre.net/*",
      "https://*.larkoffice.com/*"
    ],
    web_accessible_resources: [
      {
        resources: ['/injected.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  autoIcons: {
    grayscaleOnDevelopment: false,
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
});
