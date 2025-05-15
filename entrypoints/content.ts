// @ts-ignore
import html2pdf from "html2pdf.js";
import { createApp } from 'vue';
import App from "./popup/App.vue";

// 添加延时函数
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取所有文档链接
async function getAllDocLinks(): Promise<Array<{ token: string; title: string }>> {
  const tocElement = document.getElementById('TOC-ROOT');
  if (!tocElement) {
    console.log('未找到目录元素');
    return [];
  }

  const docs: Array<{ token: string; title: string }> = [];
  const nodes = tocElement.querySelectorAll('.workspace-tree-view-node');
  nodes.forEach(node => {
    const uid = node.getAttribute('data-node-uid');
    if (uid) {
      const wikiToken = uid.split('wikiToken=')[1];
      const titleElement = node.querySelector('.workspace-tree-view-node-content');
      const title = titleElement ? titleElement.textContent?.trim() || wikiToken : wikiToken;
      if (wikiToken) {
        docs.push({ token: wikiToken, title });
      }
    }
  });

  return docs;
}

/**
 * 导出飞书文档为PDF
 */
async function exportToPDF(filename: string = 'feishu-export.pdf'): Promise<void> {
  // 获取目标元素
  var element = document.querySelector('.root-block');

  if (element) {
    try {
      // 在生成 PDF 前转换图片为 base64
      await convertImagesToBase64(element);

      // 生成 PDF
      await html2pdf(element, {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });

      console.log(`PDF 已生成: ${filename}`);
    } catch (error) {
      console.error('PDF 生成过程中出错:', error);
    }
  } else {
    console.error('找不到目标元素 .root-block');
  }
}

// 导出单个文档
async function exportSingleDoc(doc: { token: string; title: string }): Promise<void> {
  try {
    // 找到对应的按钮并点击
    const button = document.querySelector(`[data-node-uid*="wikiToken=${doc.token}"]`);
    if (button) {
      (button as HTMLElement).click();
      console.log(`正在处理文档: ${doc.title}`);

      // 等待文档加载
      await sleep(3000);

      // 导出 PDF
      await exportToPDF(`${doc.title}.pdf`);

      // 等待 PDF 生成完成
      await sleep(1000);
    }
  } catch (error) {
    console.error(`处理文档 ${doc.title} 时出错:`, error);
  }
}

// 导出所有文档
async function exportAllDocs() {
  const docs = await getAllDocLinks();
  console.log(`找到 ${docs.length} 个文档`);

  for (let i = 0; i < docs.length; i++) {
    console.log(`正在导出第 ${i + 1}/${docs.length} 个文档: ${docs[i].title}`);
    await exportSingleDoc(docs[i]);
  }

  console.log('所有文档导出完成');
}

export default defineContentScript({
  matches: ["*://*.feishu.cn/*"],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = createApp(App);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    ui.mount();
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    console.log("Done!");

    // 添加事件监听器
    document.addEventListener('exportFeishuPDF', async () => {
      console.log('收到导出PDF事件');
      await exportAllDocs();
    });

    // 添加打印 TOC 的事件监听器
    document.addEventListener('printTOC', () => {
      console.log('收到打印TOC事件');
      const tocElement = document.getElementById('TOC-ROOT');
      if (tocElement) {
        console.log('找到 TOC 元素');
        // 获取所有的 div 元素
        const divs = tocElement.querySelectorAll('div[role="item"]');
        // 过滤出不包含 button 的 div
        const filteredDivs = Array.from(divs).filter(div => {
          return !div.querySelector('button');
        });

        // 存储所有有文本的按钮
        const buttonsWithText: { button: Element; text: string }[] = [];

        // 遍历所有符合条件的 div，找出所有的 button 元素
        filteredDivs.forEach((div, index) => {
          const buttons = div.querySelectorAll('[role="button"]');
          if (buttons.length > 0) {
            buttons.forEach((button, buttonIndex) => {
              const buttonText = (button as HTMLElement).textContent?.trim();
              if (buttonText) {
                buttonsWithText.push({ button, text: buttonText });
                console.log(`找到按钮：${buttonText}`);
              }
            });
          }
        });

        // 如果有按钮，触发最后一个按钮的点击事件
        if (buttonsWithText.length > 0) {
          const lastButton = buttonsWithText[buttonsWithText.length - 1];
          console.log(`触发最后一个按钮的点击事件，按钮文本：${lastButton.text}`);
          (lastButton.button as HTMLElement).click();
        } else {
          console.log('没有找到任何有文本的按钮');
        }
      } else {
        console.log('未找到 TOC 元素');
      }
    });
  },
});

/**
 * 将元素内的所有图片转换为 base64 格式
 * @param element 包含图片的 DOM 元素
 */
async function convertImagesToBase64(element: Element): Promise<void> {
  // 获取元素内所有图片
  const images = element.querySelectorAll('img');

  // 创建一个 Promise 数组，用于等待所有图片转换完成
  const promises = Array.from(images).map(async (img) => {
    // 如果已经是 data URL，跳过
    if (img.src.startsWith('data:')) return;

    try {
      // 创建图片加载的 Promise
      const imgLoaded = new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`图片加载失败: ${img.src}`));
        }
      });

      // 等待图片加载完成
      await imgLoaded;

      // 创建 canvas 元素
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      // 在 canvas 上绘制图片
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // 将 canvas 转换为 data URL
        try {
          const dataURL = canvas.toDataURL('image/png');
          img.src = dataURL;
        } catch (e) {
          console.warn('图片转换为 base64 失败，可能是跨域问题:', e);
        }
      }
    } catch (error) {
      console.warn('处理图片时出错:', error);
    }
  });

  // 等待所有图片处理完成
  await Promise.all(promises);
  console.log('所有图片已转换为 base64 格式');
}