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
      if (message.action === "exportPdf" || message.action === "exportImage" || message.action === "handleExportPdfAll") {
        await doInjectScript(message.action);
        return true;
      }
      return false;
    });
  },
});
