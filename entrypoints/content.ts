// @ts-ignore
import html2pdf from "html2pdf.js";
import { createApp } from 'vue';
import App from "./popup/App.vue";


/**
 * 设置页面缩放
 */
async function setZoom(zoomFactor: number): Promise<void> {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage({ action: 'setZoom', zoomFactor })
      .then(response => {
        if (response && response.success) {
          console.log(`页面缩放已设置为 ${zoomFactor * 100}%`);
          resolve();
        } else {
          console.error('设置缩放失败:', response?.error || '未知错误');
          reject(new Error(response?.error || '设置缩放失败'));
        }
      })
      .catch(error => {
        console.error('发送缩放请求失败:', error);
        reject(error);
      });
  });
}

/**
 * 导出飞书文档为PDF
 */
async function exportToPDF(): Promise<void> {
  try {
    // 设置页面缩放为 0.1 (10%)
    await setZoom(0.01);

    // 等待 2 秒，确保缩放效果完全应用
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 获取目标元素
    var element = document.querySelector('.root-block');
    console.log('找到目标元素:', element);

    if (element) {
      // 获取文档标题作为文件名
      const titleElement = document.querySelector('.doc-title');
      const title = titleElement?.textContent?.trim() || 'feishu-doc';
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');

      // 生成 PDF
      await html2pdf(element, {
        margin: [10, 10, 10, 10],
        filename: `${safeTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });

      console.log(`PDF 已生成: ${safeTitle}.pdf`);

      // PDF生成完成后恢复原始缩放
      await setZoom(1.0);
    } else {
      console.error('找不到目标元素 .root-block');
      // 如果找不到元素也要恢复缩放
      await setZoom(1.0);
    }
  } catch (error) {
    console.error('PDF 生成过程中出错:', error);
    // 出错时也要尝试恢复缩放
    try {
      await setZoom(1.0);
    } catch (e) {
      console.error('恢复缩放失败:', e);
    }
  }
}








// 控制页面缩放
async function setPageZoom(zoomFactor: number): Promise<void> {
  return new Promise((resolve, reject) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.id) {
        browser.tabs.setZoom(currentTab.id, zoomFactor, () => {
          if (browser.runtime.lastError) {
            console.error('设置缩放失败:', browser.runtime.lastError);
            reject(browser.runtime.lastError);
          } else {
            console.log(`页面缩放已设置为 ${zoomFactor * 100}%`);
            resolve();
          }
        });
      } else {
        reject(new Error('未找到当前标签页'));
      }
    });
  });
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

    // 添加导出PDF事件监听器
    document.addEventListener('exportFeishuPDF', async () => {
      console.log('收到导出PDF事件');
      await exportToPDF();
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