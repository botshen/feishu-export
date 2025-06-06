import { Docx, docx } from "@/pkg/lark/docx";
import { websiteMessenger } from "./message/website-messaging";
import { Toast } from "@/pkg/lark/env";
import { generatePublicUrl, makePublicUrlEffective } from "@/pkg/lark/image";
import { isDefined, OneHundred } from "@/pkg/common";
import { confirm } from "@/pkg/utils/notification";
import { markdownAstToHtml } from "@/pkg/utils/markdown-to-html";
import normalizeFileName from 'filenamify/browser'

// @ts-ignore
import html2pdf from "html2pdf.js";

export default defineUnlistedScript(() => {

  // websiteMessenger.onMessage('triggerExportMarkdown', async (data) => {
  //   // @ts-ignore
  //   console.error('window', window.PageMain)
  //   // eventually, send data back to the content script
  //   console.error(docx, 222);

  //   if (!docx.rootBlock) {
  //     Toast.warning({ content: 'not support' })

  //     return
  //   }
  //   console.error(docx.isReady(), 333);
  //   if (!docx.isReady()) {
  //     Toast.warning({
  //       content: 'content loading',
  //     })

  //     return
  //   }

  //   const { root, images } = docx.intoMarkdownAST()
  //   console.error(root, 444);
  //   const tokens = images
  //     .map(image => {
  //       if (!image.data?.token) return null

  //       const { token } = image.data
  //       const publicUrl = generatePublicUrl(token)
  //       const code = new URL(publicUrl).searchParams.get('code')
  //       if (!code) return null

  //       image.url = publicUrl

  //       return [token, code]
  //     })
  //     .filter(isDefined)

  //   const markdown = Docx.stringify(root)
  //   console.error(markdown, 555);
  //   if (!window.document.hasFocus()) {
  //     const confirmed = await confirm()
  //     if (!confirmed) {
  //       return
  //     }
  //   }

  //   // clipboard.write() method may be intercepted and overridden by websites
  //   const writeToClipboard = (
  //     Object.getPrototypeOf(window.navigator.clipboard) as Clipboard
  //   ).write.bind(window.navigator.clipboard)

  //   await writeToClipboard([
  //     new ClipboardItem({
  //       'text/plain': new Blob([markdown], { type: 'text/plain' }),
  //     }),
  //   ])

  //   if (tokens.length > 0) {
  //     const isSuccess = await makePublicUrlEffective(
  //       Object.fromEntries(tokens) as Record<string, string>,
  //     )
  //     if (!isSuccess) {
  //       Toast.error({
  //         content: 'failed to copy images',
  //       })
  //     }
  //   }
  // });

  // 添加导出HTML的消息处理函数
  websiteMessenger.onMessage('exportPdf', async (data) => {
    if (!docx.rootBlock) {
      Toast.warning({ content: '请刷新' })
      return
    }

    if (!docx.isReady()) {
      Toast.warning({
        content: 'content loading',
      })
      return
    }

    const { root, images } = docx.intoMarkdownAST()
    const recommendName = docx.pageTitle
      ? normalizeFileName(docx.pageTitle.slice(0, OneHundred))
      : 'doc'
    // 处理图片URL和token
    const tokens = images
      .map(image => {
        if (!image.data?.token) return null
        const { token } = image.data
        const publicUrl = generatePublicUrl(token)
        const code = new URL(publicUrl).searchParams.get('code')
        if (!code) return null

        // 设置图片URL
        image.url = publicUrl
        return [token, code]
      })
      .filter(isDefined)

    // 先确保所有图片URL生效
    if (tokens.length > 0) {
      const isSuccess = await makePublicUrlEffective(
        Object.fromEntries(tokens) as Record<string, string>,
      )
      if (!isSuccess) {
        Toast.error({
          content: 'failed to make images public',
        })
        return
      }
    }

    // 转换为HTML
    const html = markdownAstToHtml(root)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    console.error('html', html)

    // 生成PDF
    await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: `${recommendName}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        pagebreak: { 
          mode: 'avoid-all',
          avoid: ['*'] // 避免所有元素被分割
        },
        html2canvas: {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          logging: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(tempDiv)
      .save();
  });
});