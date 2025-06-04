import { createProgressDisplay } from "../process-bar/bar-display";
import { collectAllBlocks } from "./pdf-util";
import { printTOC } from "./toc-tree";
// @ts-ignore
import html2pdf from "html2pdf.js";
// @ts-ignore
import JSZip from "jszip";

/**
 * 导出单个页面为PDF，返回PDF数据
 */
async function exportSinglePageToPDF(title?: string): Promise<{ fileName: string; data: Uint8Array }> {
  try {
    // Collect all blocks
    const completeElement = await collectAllBlocks();
    if (!completeElement) {
      throw new Error('Failed to find container element');
    }

    console.log('收集完成，准备导出 PDF');

    // 确定文件名：优先使用传入的title，否则获取文档标题
    let fileName: string;
    if (title) {
      fileName = `${title}.pdf`;
    } else {
      // 获取文档标题
      const docTitleElement = document.querySelector('.doc-title');
      const docTitle = docTitleElement?.textContent?.trim() || 'feishu-doc';
      const safeDocTitle = docTitle.replace(/[\\/:*?"<>|]/g, '_');
      fileName = `${safeDocTitle}.pdf`;
    }

    console.log(`使用文件名: ${fileName}`);

    // Export to PDF with collected content and get blob data
    const pdfBlob = await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName,
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
      .output('arraybuffer');

    console.log(`页面 PDF 已生成: ${title}`);

    return {
      fileName,
      data: new Uint8Array(pdfBlob)
    };

  } catch (error) {
    console.error('PDF 生成过程中出错:', error);
    throw error;
  }
}

/**
 * 按照目录顺序批量导出PDF并打包成zip
 */
export async function exportToPDF(): Promise<void> {
  console.log('开始按目录顺序批量导出PDF');

  try {
    // 查找目录元素
    const tocElement = document.getElementById('TOC-ROOT');
    if (!tocElement) {
      console.log('未找到TOC元素，将只导出当前页面');
      // 单页导出才需要处理缩放
      const pdfData = await exportSinglePageToPDF(undefined);
      downloadPDF(pdfData.data, pdfData.fileName);
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

      // 获取知识库/文件夹名称
      const wikiTitle = document.querySelector('.wiki-title')?.textContent?.trim();
      const folderTitle = document.querySelector('.folder-title')?.textContent?.trim();
      const baseTitle = (wikiTitle || folderTitle || '飞书文档导出').replace(/[\\/:*?"<>|]/g, '_');

      // 创建进度显示
      const progress = createProgressDisplay();

      // 创建一个新的 JSZip 实例
      const zip = new JSZip();

      // 按顺序处理每个按钮，从第一个开始
      for (let i = 0; i < buttonsWithText.length; i++) {
        const button = buttonsWithText[i];

        // 更新进度显示
        progress.updateProgress(i + 1, buttonsWithText.length, button.text, '准备导出页面');

        console.log(`处理第 ${i + 1}/${buttonsWithText.length} 个目录项，文本：${button.text}`);

        // 点击按钮前，确保所有菜单都是展开的
        await printTOC();

        // 点击按钮，切换到对应内容
        (button.button as HTMLElement).click();

        // 等待内容加载
        progress.updateProgress(i + 1, buttonsWithText.length, button.text, '加载页面内容...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          // 更新状态
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, '生成PDF中...');

          // 准备文件名 - 只使用序号和页面标题
          const safeTitle = button.text.replace(/[\\/:*?"<>|]/g, '_');
          const fileName = `${i + 1}_${safeTitle}`;

          // 导出当前页面为PDF并添加到zip
          const pdfData = await exportSinglePageToPDF(fileName);
          zip.file(pdfData.fileName, pdfData.data);

          // 更新状态
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, 'PDF已添加到压缩包');

          // 等待PDF处理完成
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`处理页面 "${button.text}" 时出错:`, error);
          progress.updateProgress(i + 1, buttonsWithText.length, button.text, '处理出错，跳过');
          // 继续处理下一个页面
        }
      }


      // 更新进度显示的缩放
      progress.updateScaling(1.0);

      // 生成zip文件
      progress.updateProgress(buttonsWithText.length, buttonsWithText.length, '', '正在生成压缩包...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 生成时间戳，格式：YYYYMMDD_HHmmss
      const now = new Date();
      const timestamp = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

      const zipFileName = `${baseTitle}_${timestamp}.zip`;

      // 下载zip文件
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 完成所有导出后更新进度条
      progress.setComplete(buttonsWithText.length);

      // 5秒后移除进度提示
      setTimeout(() => {
        progress.remove();
      }, 5000);

      console.log('批量导出完成');
    } else {
      console.log('没有找到任何目录项，将只导出当前页面');
      const pdfData = await exportSinglePageToPDF(undefined);
      downloadPDF(pdfData.data, pdfData.fileName);
    }
  } catch (error) {
    console.error('批量导出过程中出错:', error);
    alert('导出过程中出错，请查看控制台获取详细信息');

  }
}

/**
 * 下载单个PDF文件
 */
function downloadPDF(data: Uint8Array, fileName: string) {
  const blob = new Blob([data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}