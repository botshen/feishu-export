export interface ScrollInfo {
  totalHeight: number;
  viewportHeight: number;
  currentScroll: number;
}

async function getPageScrollInfo(tabId: number): Promise<ScrollInfo> {
  // 飞书文档的主要内容容器
  const scrollContainer = document.querySelector('.bear-web-x-container.catalogue-opened.docx-in-wiki');
  if (!scrollContainer) {
    throw new Error('Cannot find scroll container');
  }

  return {
    totalHeight: scrollContainer.scrollHeight,
    viewportHeight: scrollContainer.clientHeight,
    currentScroll: scrollContainer.scrollTop
  };
}

async function scrollPage(tabId: number, position: number): Promise<void> {
  const scrollContainer = document.querySelector('.bear-web-x-container.catalogue-opened.docx-in-wiki');
  if (!scrollContainer) {
    throw new Error('Cannot find scroll container');
  }
  
  scrollContainer.scrollTo({
    top: position,
    behavior: 'smooth'
  });
}

export async function captureScreen(tab: Browser.tabs.Tab): Promise<void> {
  if (!tab.id) {
    console.error("无法获取当前标签页信息");
    return;
  }

  try {
    // 获取页面滚动信息
    const scrollInfo = await getPageScrollInfo(tab.id);
    console.log('页面总高度:', scrollInfo.totalHeight);
    console.log('视口高度:', scrollInfo.viewportHeight);

    // 计算需要滚动的次数
    const scrollStep = scrollInfo.viewportHeight * 0.8; // 每次滚动 80% 视口高度
    const totalScrolls = Math.ceil(scrollInfo.totalHeight / scrollStep);

    // 执行滚动
    for (let i = 0; i < totalScrolls; i++) {
      const nextScrollPosition = i * scrollStep;
      await scrollPage(tab.id, nextScrollPosition);
      // 等待滚动完成和页面渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 暂时注释截图相关逻辑
    /*
    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });

    const now = new Date();
    const timestamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const filename = `screenshot_${timestamp}.png`;

    await browser.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true
    });

    console.log(`截屏已保存为: ${filename}`);
    */
  } catch (error) {
    console.error("操作失败:", error);
  }
}
