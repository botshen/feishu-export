// @ts-ignore
import html2pdf from "html2pdf.js";
import { createApp } from 'vue';
import App from "../components/App.vue";

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
 * 导出单个页面为PDF并返回Blob对象
 */
async function exportSinglePageToPDF(title?: string, restoreZoom: boolean = true): Promise<Blob> {
  try {
    // 设置页面缩放为 0.01 (1%)
    await setZoom(0.01);

    // 等待 2 秒，确保缩放效果完全应用
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 获取目标元素
    var element = document.querySelector('.root-block');
    console.log('找到目标元素:', element);

    if (element) {
      // 获取文档标题作为文件名
      const titleElement = document.querySelector('.doc-title');
      const pageTitle = title || titleElement?.textContent?.trim() || 'feishu-doc';
      console.log(`正在生成页面: ${pageTitle}`);

      // 生成 PDF 但不自动下载
      const pdfBlob = await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${pageTitle}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          output: 'blob'
        })
        .from(element)
        .save();

      console.log(`页面 PDF 已生成: ${pageTitle}`);

      // PDF生成完成后，仅在需要时恢复原始缩放
      if (restoreZoom) {
        await setZoom(1.0);
      }

      return pdfBlob;
    } else {
      console.error('找不到目标元素 .root-block');
      // 如果找不到元素也要恢复缩放
      if (restoreZoom) {
        await setZoom(1.0);
      }
      throw new Error('找不到目标元素');
    }
  } catch (error) {
    console.error('PDF 生成过程中出错:', error);
    // 出错时也要尝试恢复缩放
    if (restoreZoom) {
      try {
        await setZoom(1.0);
      } catch (e) {
        console.error('恢复缩放失败:', e);
      }
    }
    throw error;
  }
}

/**
 * 下载Blob对象
 */
function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // 清理URL对象
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 100);
}

/**
 * 创建不受页面缩放影响的进度显示
 */
function createProgressDisplay(): {
  element: HTMLElement;
  updateProgress: (current: number, total: number, title: string, status: string) => void;
  setComplete: (total: number) => void;
  remove: () => void;
} {
  // 创建一个固定在右上角的div元素
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '10px';
  container.style.right = '10px';
  container.style.width = '300px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.color = 'white';
  container.style.padding = '15px';
  container.style.borderRadius = '5px';
  container.style.zIndex = '99999999'; // 极高的z-index确保显示在最上层
  container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  container.style.fontFamily = 'Arial, sans-serif';

  // 设置一个极大的transform值以抵消页面缩放
  container.style.transform = 'scale(4)';
  container.style.transformOrigin = 'top right';

  // 创建标题
  const title = document.createElement('div');
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  title.style.fontSize = '14px';
  title.textContent = '正在导出文档';
  container.appendChild(title);

  // 创建当前项目信息
  const current = document.createElement('div');
  current.style.marginBottom = '5px';
  current.style.fontSize = '12px';
  current.textContent = '准备中...';
  container.appendChild(current);

  // 创建进度条容器
  const progressContainer = document.createElement('div');
  progressContainer.style.width = '100%';
  progressContainer.style.backgroundColor = '#444';
  progressContainer.style.height = '10px';
  progressContainer.style.borderRadius = '5px';
  progressContainer.style.overflow = 'hidden';
  container.appendChild(progressContainer);

  // 创建进度条
  const progressBar = document.createElement('div');
  progressBar.style.height = '100%';
  progressBar.style.backgroundColor = '#4CAF50';
  progressBar.style.width = '0%';
  progressBar.style.transition = 'width 0.3s';
  progressContainer.appendChild(progressBar);

  // 创建状态文本
  const status = document.createElement('div');
  status.style.marginTop = '5px';
  status.style.fontSize = '12px';
  status.style.color = '#aaa';
  status.textContent = '初始化中...';
  container.appendChild(status);

  document.body.appendChild(container);

  // 返回控制对象
  return {
    element: container,
    updateProgress: (currItem: number, total: number, title: string, statusText: string) => {
      const progress = Math.round((currItem / total) * 100);
      current.textContent = `处理: ${currItem}/${total} - ${title}`;
      progressBar.style.width = `${progress}%`;
      status.textContent = `已完成: ${progress}% - ${statusText}`;
    },
    setComplete: (total: number) => {
      title.textContent = '导出完成！';
      current.textContent = `已处理: ${total}/${total}`;
      progressBar.style.width = '100%';
      status.textContent = '所有PDF已导出';
      progressBar.style.backgroundColor = '#2196F3';
    },
    remove: () => {
      container.remove();
    }
  };
}

/**
 * 按照目录顺序批量导出PDF
 */
async function exportToPDF(): Promise<void> {
  console.log('开始按目录顺序批量导出PDF');

  try {
    // 查找目录元素
    const tocElement = document.getElementById('TOC-ROOT');
    if (!tocElement) {
      console.log('未找到TOC元素，将只导出当前页面');
      const pdfBlob = await exportSinglePageToPDF();

      // 获取文档标题作为文件名
      const titleElement = document.querySelector('.doc-title');
      const title = titleElement?.textContent?.trim() || 'feishu-doc';
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');

      downloadBlob(pdfBlob, `${safeTitle}.pdf`);
      return;
    }

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
            console.log(`找到目录按钮：${buttonText}`);
          }
        });
      }
    });

    // 如果找到按钮，按顺序点击并导出PDF
    if (buttonsWithText.length > 0) {
      console.log(`找到 ${buttonsWithText.length} 个目录项，开始批量导出...`);

      // 获取文档主标题
      const docTitleElement = document.querySelector('.doc-title');
      const docTitle = docTitleElement?.textContent?.trim() || 'feishu-doc';
      const safeDocTitle = docTitle.replace(/[\\/:*?"<>|]/g, '_');

      // 创建进度显示
      const progress = createProgressDisplay();

      // 按顺序处理每个按钮，从第一个开始
      for (let i = 0; i < buttonsWithText.length; i++) {
        const button = buttonsWithText[i];
        const isLastItem = i === buttonsWithText.length - 1;

        // 更新进度显示
        progress.updateProgress(i + 1, buttonsWithText.length, button.text, '准备导出页面');

        console.log(`处理第 ${i + 1}/${buttonsWithText.length} 个目录项，文本：${button.text}`);

        // 点击按钮，切换到对应内容
        (button.button as HTMLElement).click();

        // 等待内容加载
        progress.updateProgress(i + 1, buttonsWithText.length, button.text, '加载页面内容...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          // 更新状态
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, '生成PDF中...');

          // 导出当前页面为PDF，仅在最后一项时还原缩放
          const pdfBlob = await exportSinglePageToPDF(button.text, isLastItem);

          // 直接下载当前页面的PDF
          const safeTitle = button.text.replace(/[\\/:*?"<>|]/g, '_');
          downloadBlob(pdfBlob, `${safeDocTitle}_${i + 1}_${safeTitle}.pdf`);

          // 更新状态
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, 'PDF已保存');

          // 等待PDF处理完成
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`处理页面 "${button.text}" 时出错:`, error);
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, '处理出错，跳过');
          // 继续处理下一个页面
          continue;
        }
      }

      // 完成所有导出后更新进度条
      progress.setComplete(buttonsWithText.length);

      // 5秒后移除进度提示
      setTimeout(() => {
        progress.remove();
      }, 5000);

      console.log('批量导出完成');
    } else {
      console.log('没有找到任何目录项，将只导出当前页面');
      const pdfBlob = await exportSinglePageToPDF();

      // 获取文档标题作为文件名
      const titleElement = document.querySelector('.doc-title');
      const title = titleElement?.textContent?.trim() || 'feishu-doc';
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');

      downloadBlob(pdfBlob, `${safeTitle}.pdf`);
    }
  } catch (error) {
    console.error('批量导出过程中出错:', error);
    alert('导出过程中出错，请查看控制台获取详细信息');
  }
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


    // 添加导出PDF事件监听器
    document.addEventListener('exportFeishuPDF', async () => {
      console.log('收到导出PDF事件');
      await exportToPDF();
    });
  },
});