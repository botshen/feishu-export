import { exportToPDF } from "./export-pdf/pdf-export";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { injectScriptToPage } from "../utils";

async function collectAllBlocks(block_sequence: string[]) {
  const container = document.querySelector('.bear-web-x-container.docx-in-wiki') as HTMLElement;
  if (!container) return null;

  // Create a temporary container to store all blocks
  const tempContainer = document.createElement('div');
  tempContainer.className = 'render-unit-wrapper';
  
  const viewportHeight = container.clientHeight;
  const totalHeight = container.scrollHeight;
  const collectedBlocks = new Set<string>();
  
  // Function to collect visible blocks
  const collectVisibleBlocks = () => {
    const blocks = document.querySelectorAll('[data-record-id]');
    blocks.forEach(block => {
      const recordId = block.getAttribute('data-record-id');
      if (recordId && block_sequence.includes(recordId) && !collectedBlocks.has(recordId)) {
        collectedBlocks.add(recordId);
        tempContainer.appendChild(block.cloneNode(true));
      }
    });
  };

  // Initial collection
  collectVisibleBlocks();
  
  // Scroll and collect
  let currentScroll = 0;
  while (currentScroll < totalHeight && collectedBlocks.size < block_sequence.length) {
    currentScroll += viewportHeight;
    container.scrollTo(0, currentScroll);
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    collectVisibleBlocks();
  }

  // Reset scroll position
  container.scrollTo(0, 0);
  
  return tempContainer;
}


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
      const block_sequence_new = block_sequence.slice(1, -1);

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