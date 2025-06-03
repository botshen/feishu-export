
import { exportToPDF } from "./export-pdf/pdf-export";


export default defineContentScript({
  matches: ["*://*.feishu.cn/*"],
  main() {
    // 添加导出PDF事件监听器
    document.addEventListener('exportFeishuPDF', () => exportToPDF());

    // 添加来自 background 的消息监听器
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'triggerExportPdf') {
        console.log('触发 exportFeishuPDF 事件');
        document.dispatchEvent(new CustomEvent('exportFeishuPDF'));
        return true;
      }
      return false;
    });
  },
});