import { exportToPDF } from "./export-pdf/pdf-export";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { injectScriptToPage } from "../utils";
import { collectAllBlocks } from "./export-pdf/pdf-util";



export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
   async main() {
    console.log('Content script loaded and running');
    injectScriptToPage()
    // 添加来自 background 的消息监听器
    browser.runtime.onMessage.addListener((message) => {
       if (message.action === 'triggerExportPdf') {
        exportToPDF();
        return true;
      }
      if (message.action === 'triggerCaptureScreen') {
       
        window.dispatchEvent(new CustomEvent('message-to-injected', {
        detail: {
          action: 'getWindow',
          id: message.id
        }
       }));
         return true;
      }
      return false;
    });
    window.addEventListener('message-to-content', (async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.info('收到来自 injected 脚本的消息:', customEvent.detail);
      const block_sequence = customEvent.detail.data.window.block_sequence;
      const block_sequence_new = block_sequence.slice(0, -1);

      // Collect all blocks
      const completeElement = await collectAllBlocks(block_sequence_new);
      if (!completeElement) {
        console.error('Failed to find container element');
        return;
      }

      console.log('收集完成，准备导出 PDF');
      
      // Export to PDF with collected content
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `xxx.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(completeElement)
        .save();
    }) as EventListener);
     
  },
});