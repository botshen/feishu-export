
export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    // 创建一个分享菜单项
    // browser.contextMenus.create({
    //   id: "exportPdfAll",
    //   title: "批量导出pdf",
    //   contexts: ["all"],
    //   documentUrlPatterns: ["*://*.feishu.cn/*"]
    // });
    // 创建截屏菜单项
    browser.contextMenus.create({
      id: "exportPdf",
      title: "导出当前文档为pdf",
      contexts: ["all"]
    });

  });
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case "exportPdf":
        if (tab && tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, { action: "exportPdf" });
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
