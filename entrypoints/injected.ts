import { Docx, docx } from "@/pkg/lark/docx";
import { websiteMessenger } from "./message/website-messaging";
import { Toast } from "@/pkg/lark/env";
import { generatePublicUrl, makePublicUrlEffective } from "@/pkg/lark/image";
import { isDefined } from "@/pkg/common";
import { confirm } from "@/pkg/utils/notification";

export default defineUnlistedScript(() => {

  websiteMessenger.onMessage('triggerExportMarkdown', async (data) => {
    // @ts-ignore
    console.error('window', window.PageMain)
    // eventually, send data back to the content script
    console.error(docx, 222);

    if (!docx.rootBlock) {
      Toast.warning({ content: 'not support' })

      return
    }
    console.error(docx.isReady(), 333);
    if (!docx.isReady()) {
      Toast.warning({
        content: 'content loading',
      })

      return
    }

    const { root, images } = docx.intoMarkdownAST()
    console.error(root, 444);
    const tokens = images
      .map(image => {
        if (!image.data?.token) return null

        const { token } = image.data
        const publicUrl = generatePublicUrl(token)
        const code = new URL(publicUrl).searchParams.get('code')
        if (!code) return null

        image.url = publicUrl

        return [token, code]
      })
      .filter(isDefined)

    const markdown = Docx.stringify(root)
    console.error(markdown, 555);
    if (!window.document.hasFocus()) {
      const confirmed = await confirm()
      if (!confirmed) {
        return
      }
    }

    // clipboard.write() method may be intercepted and overridden by websites
    const writeToClipboard = (
      Object.getPrototypeOf(window.navigator.clipboard) as Clipboard
    ).write.bind(window.navigator.clipboard)

    await writeToClipboard([
      new ClipboardItem({
        'text/plain': new Blob([markdown], { type: 'text/plain' }),
      }),
    ])

    if (tokens.length > 0) {
      const isSuccess = await makePublicUrlEffective(
        Object.fromEntries(tokens) as Record<string, string>,
      )
      if (!isSuccess) {
        Toast.error({
          content: 'failed to copy images',
        })
      }
    }
  });
});