import { createProgressDisplay } from "../process-bar/bar-display";
import { collectAllBlocks, setZoom } from "./pdf-util";
import { printTOC } from "./toc-tree";
// @ts-ignore
import html2pdf from "html2pdf.js";
/**
 * 导出单个页面为PDF，直接下载
 */
async function exportSinglePageToPDF(title?: string): Promise<void> {
  try {


    // Collect all blocks
    const completeElement = await collectAllBlocks();
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

    console.log(`页面 PDF 已生成并下载: ${title}`);


  } catch (error) {
    console.error('PDF 生成过程中出错:', error);

    throw error;
  }
}



/**
 * 按照目录顺序批量导出PDF
 */
export async function exportToPDF(): Promise<void> {
  console.log('开始按目录顺序批量导出PDF');

  try {
    // 查找目录元素
    const tocElement = document.getElementById('TOC-ROOT');
    if (!tocElement) {
      console.log('未找到TOC元素，将只导出当前页面');
      // 单页导出才需要处理缩放
      await exportSinglePageToPDF(undefined);
      return;
    }

    console.log('找到 TOC 元素');
    // 打印目录树
    await printTOC();

    // 获取所有的 div 元素
    const divs = tocElement.querySelectorAll('div[role="item"]');
    // 过滤出不包含 button 的 div
    const filteredDivs = Array.from(divs).filter(div => {
      return !div.querySelector('button');
    });

    // 存储所有有文本的按钮
    const buttonsWithText: { button: Element; text: string }[] = [];

    // 遍历所有符合条件的 div，找出所有的 button 元素
    filteredDivs.forEach(div => {
      const buttons = div.querySelectorAll('[role="button"]');
      if (buttons.length > 0) {
        buttons.forEach(button => {
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

          // 准备文件名
          const safeTitle = button.text.replace(/[\\/:*?"<>|]/g, '_');
          const fileName = `${safeDocTitle}_${i + 1}_${safeTitle}`;

          // 直接导出并下载当前页面为PDF，不处理缩放
          await exportSinglePageToPDF(fileName);

          // 更新状态
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, 'PDF已保存');

          // 等待PDF处理完成
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`处理页面 "${button.text}" 时出错:`, error);
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, '处理出错，跳过');
          // 继续处理下一个页面
        }
      }

      // 完成所有导出后才恢复缩放
      await setZoom(1.0);
      // 更新进度显示的缩放
      progress.updateScaling(1.0);

      // 完成所有导出后更新进度条
      progress.setComplete(buttonsWithText.length);

      // 5秒后移除进度提示
      setTimeout(() => {
        progress.remove();
      }, 5000);

      console.log('批量导出完成');
    } else {
      console.log('没有找到任何目录项，将只导出当前页面');
      await exportSinglePageToPDF(undefined);
    }
  } catch (error) {
    console.error('批量导出过程中出错:', error);
    alert('导出过程中出错，请查看控制台获取详细信息');
    // 确保在出错时也恢复缩放
    try {
      await setZoom(1.0);
    } catch (e) {
      console.error('恢复缩放失败:', e);
    }
  }
}