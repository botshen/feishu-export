export default defineBackground(() => {

  // 监听来自内容脚本的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('收到消息:', message);

    if (message.action === 'setZoom') {
      const tabId = sender.tab?.id;
      const zoomFactor = message.zoomFactor;

      if (tabId && typeof zoomFactor === 'number') {
        browser.tabs.setZoom(tabId, zoomFactor)
          .then(() => {
            console.log(`已将标签页 ${tabId} 的缩放设置为 ${zoomFactor * 100}%`);
            sendResponse({ success: true });
          })
          .catch((error) => {
            console.error('设置缩放失败:', error);
            sendResponse({ success: false, error: error.message });
          });

        return true; // 表示将异步发送响应
      }
    }

    return false; // 没有异步响应
  });
  browser.runtime.onInstalled.addListener(() => {
    // 创建一个分享菜单项
    browser.contextMenus.create({
      id: "exportPdf",
      title: "批量导出pdf",
      contexts: ["all"],
      documentUrlPatterns: ["*://*.feishu.cn/*"]
    });
  });
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case "exportPdf":
        console.log("点击了导出pdf");
        // 向当前标签页发送消息，触发 exportFeishuPDF 事件
        if (tab && tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, { action: "triggerExportPdf" });
            console.log("已发送导出PDF消息到标签页");
          } catch (error) {
            console.error("发送消息到标签页失败:", error);
          }
        } else {
          console.error("无法获取当前标签页信息");
        }
        break;
      default:
        break;
    }
  });
});
