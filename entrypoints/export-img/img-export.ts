
export async function captureScreen(tab: Browser.tabs.Tab): Promise<void> {
  if (!tab.id) {
    console.error("无法获取当前标签页信息");
    return;
  }

  try {
    // 使用 chrome.tabs.captureVisibleTab 截取当前可见标签页
    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });

    // 创建下载链接
    const now = new Date();
    const timestamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const filename = `screenshot_${timestamp}.png`;

    // 使用 chrome.downloads API 下载截图
    await browser.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true
    });

    console.log(`截屏已保存为: ${filename}`);
  } catch (error) {
    console.error("截屏失败:", error);
  }
}
