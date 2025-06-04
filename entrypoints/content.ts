import { exportToPDF } from "./export-pdf/pdf-export";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { collectAllBlocks } from "./export-pdf/pdf-util";
import { exportToImg } from "./export-img/img-export";

export default defineContentScript({
  matches: [
    "https://*.feishu.cn/*",
    "https://*.feishu.net/*",
    "https://*.larksuite.com/*",
    "https://*.feishu-pre.net/*",
    "https://*.larkoffice.com/*"
  ],
  runAt: 'document_end',
  async main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message.action === 'triggerExportPdf') {
        await exportToPDF();
        return true;
      }
      if (message.action === 'triggerCaptureScreen') {
        // Collect all blocks
        const completeElement = await collectAllBlocks();
        if (!completeElement) {
          console.error('Failed to find container element');
          return;
        }

        console.log('收集完成，准备导出 PDF');

        // 获取文档标题
        const docTitleElement = document.querySelector('.doc-title');
        const docTitle = docTitleElement?.textContent?.trim() || 'feishu-doc';
        const safeDocTitle = docTitle.replace(/[\\/:*?"<>|]/g, '_');

        console.log(`使用文档标题: ${safeDocTitle}`);

        // Export to PDF with collected content
        await html2pdf()
          .set({
            margin: [10, 10, 10, 10],
            filename: `${safeDocTitle}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
              scale: 4,
              useCORS: true,
              allowTaint: true,
              logging: true,
              imageTimeout: 0,
              onclone: (clonedDoc: Document) => {
                return new Promise(resolve => {
                  setTimeout(() => {
                    const images = clonedDoc.getElementsByTagName('img');
                    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
                      if (img.complete) return Promise.resolve();
                      return new Promise(imgResolve => {
                        img.onload = imgResolve;
                        img.onerror = imgResolve;
                      });
                    });
                    Promise.all(imagePromises).then(resolve);
                  }, 1000);
                });
              }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(completeElement)
          .save();
        return true;
      }
      if (message.action === 'triggerExportImg') {
        console.log('点击了导出图片');
        await exportToImg();
        return true;
      }
      return false;
    });
  },
});