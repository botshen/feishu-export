
export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    // 创建一个分享菜单项
    browser.contextMenus.create({
      id: "exportPdf",
      title: "批量导出pdf",
      contexts: ["all"],
      documentUrlPatterns: ["*://*.feishu.cn/*"]
    });
    // 创建截屏菜单项
    browser.contextMenus.create({
      id: "captureScreen",
      title: "导出当前文档为pdf",
      contexts: ["all"]
    });
    // browser.contextMenus.create({
    //   id: "exportImg",
    //   title: "导出当前文档为图片",
    //   contexts: ["all"]
    // });
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
      case "captureScreen":
        console.log("点击了截屏");
        if (tab && tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, { action: "triggerCaptureScreen" });
            console.log("截屏消息已发送到标签页");
          } catch (error) {
            console.error("发送截屏消息失败:", error);
          }
        }
        break;
      case "exportImg":
        console.log("点击了导出图片");
        if (tab && tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, { action: "triggerExportImg" });
            console.log("导出图片消息已发送到标签页");
          } catch (error) {
            console.error("发送导出图片消息失败:", error);
          }
        }
        break;
      default:
        break;
    }
  });
});
