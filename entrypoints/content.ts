import { doInjectScript } from "@/pkg/utils/inject-help";
 

export default defineContentScript({
  matches: [
    "https://*.feishu.cn/*",
    "https://*.feishu.net/*",
    "https://*.larksuite.com/*",
    "https://*.feishu-pre.net/*",
    "https://*.larkoffice.com/*",
  ],
  runAt: "document_end",
  async main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message.action === "exportPdf") {
        await doInjectScript();
        return true;
      }
      return false;
    });
  },
});
