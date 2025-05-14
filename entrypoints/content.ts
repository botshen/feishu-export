// @ts-ignore
import html2pdf from "html2pdf.js";
import { createApp } from 'vue';
import App from "./popup/App.vue";

export default defineContentScript({
  matches: ["*://*.feishu.cn/*"],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        // Define how your UI will be mounted inside the container
        const app = createApp(App);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        // Unmount the app when the UI is removed
        app?.unmount();
      },
    });

    // 4. Mount the UI
    ui.mount();
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    console.log("Done!");

    // 添加事件监听器
    document.addEventListener('exportFeishuPDF', async () => {
      console.log('收到导出PDF事件');
      await exportToPDF();
    });
  },
});

/**
 * 导出飞书文档为PDF
 */
async function exportToPDF(): Promise<void> {
  // 获取目标元素
  var element = document.querySelector('.root-block');

  if (element) {
    try {
      // 在生成 PDF 前转换图片为 base64
      await convertImagesToBase64(element);

      // 生成 PDF
      html2pdf(element, {
        margin: [10, 10, 10, 10],
        filename: 'feishu-export.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
    } catch (error) {
      console.error('PDF 生成过程中出错:', error);
    }
  } else {
    console.error('找不到目标元素 .root-block');
  }
}

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