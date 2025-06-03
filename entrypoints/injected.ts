export default defineUnlistedScript(() => {
  console.log("injected script loaded");
  function sendResponseToContent(data: any) {
    window.dispatchEvent(new CustomEvent('message-to-content', {
      detail: data
    }));
  }
  window.addEventListener('message-to-injected', (event) => {
    const data = (event as CustomEvent).detail;
    console.error('收到来自 content script 的消息:', data);
    console.error('window',window.DATA )
    // 根据消息类型处理
    if (data.action === 'getWindow') {
      console.log('window',window)
      sendResponseToContent({ 
        response: 'windowData', 
         data:{
          window:window.DATA.clientVars.data,
         }
      });
    }
  });
});
