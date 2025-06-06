import { docx } from "@/pkg/lark/docx";
import { websiteMessenger } from "./message/website-messaging";
import { Toast } from "@/pkg/lark/env";

export default defineUnlistedScript(() => {

  websiteMessenger.onMessage('triggerExportMarkdown', data => {
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
  });
});