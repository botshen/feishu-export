export default defineUnlistedScript(() => {
  console.error("injected script loaded", window.PageMain.blockManager.rootBlockModel);
  // function sendResponseToContent(data: any) {
  //   window.dispatchEvent(new CustomEvent('message-to-content', {
  //     detail: data
  //   }));
  // }
  // window.addEventListener('message-to-injected', (event) => {
  //   const data = (event as CustomEvent).detail;
  //   console.error('收到来自 content script 的消息:', data);
  //   console.error('window', window.PageMain)
  //   // 根据消息类型处理
  //   if (data.action === 'getWindow') {
  //     console.log('window', window)
  //     sendResponseToContent({
  //       response: 'windowData',
  //       data: {
  //         window: window.PageMain
  //       }
  //     });
  //   }
  // });
});