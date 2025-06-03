import { exportToPDF } from "./export-pdf/pdf-export";

export default defineContentScript({
  matches: ["*://*.feishu.cn/*"],
  main() {
    // 添加来自 background 的消息监听器
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'triggerExportPdf') {
        exportToPDF();
        return true;
      }
      return false;
    });
  },
});