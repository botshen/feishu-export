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
  },
  autoIcons: {
    grayscaleOnDevelopment: false,
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
});
