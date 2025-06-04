/**
 * 设置页面缩放
 */
export async function setZoom(zoomFactor: number): Promise<void> {
  try {
    const response = await browser.runtime.sendMessage({ action: 'setZoom', zoomFactor });

    if (response && response.success) {
      console.log(`页面缩放已设置为 ${zoomFactor * 100}%`);
    } else {
      throw new Error(response?.error || '设置缩放失败');
    }
  } catch (error) {
    console.error('发送缩放请求失败:', error);
    throw error;
  }
}

export async function collectAllBlocks() {
  const container = document.querySelector('.bear-web-x-container.docx-in-wiki') as HTMLElement;
  if (!container) return null;

  const tempContainer = document.createElement('div');
  tempContainer.className = 'render-unit-wrapper';

  const FIXED_HEADER_HEIGHT = 65;
  const viewportHeight = container.clientHeight - FIXED_HEADER_HEIGHT;
  const totalHeight = container.scrollHeight;
  const bannerHeight = 500;
  const collectedBlocks = new Map<number, HTMLElement>();

  const collectVisibleBlocks = () => {
    const blocks = document.querySelectorAll('.render-unit-wrapper > div[data-block-id]');
    blocks.forEach(block => {
      const blockId = parseInt(block.getAttribute('data-block-id') || '0');
      if (blockId >= 2 && !collectedBlocks.has(blockId)) {
        collectedBlocks.set(blockId, block.cloneNode(true) as HTMLElement);
      }
    });
  };

  // Initial collection
  container.scrollTo(0, bannerHeight);
  await new Promise(resolve => setTimeout(resolve, 100));
  collectVisibleBlocks();

  let currentScroll = bannerHeight;
  const scrollStep = Math.floor(viewportHeight * 0.9);
  let lastCollectedSize = 0;
  let noNewBlocksCount = 0;

  // 快速滚动到底部
  while (currentScroll < totalHeight && noNewBlocksCount < 2) {
    currentScroll += scrollStep;
    container.scrollTo(0, currentScroll);
    await new Promise(resolve => setTimeout(resolve, 100));
    collectVisibleBlocks();

    if (collectedBlocks.size === lastCollectedSize) {
      noNewBlocksCount++;
    } else {
      noNewBlocksCount = 0;
      lastCollectedSize = collectedBlocks.size;
    }
  }

  // Final collection at bottom
  container.scrollTo(0, totalHeight);
  await new Promise(resolve => setTimeout(resolve, 150));
  collectVisibleBlocks();

  // 直接返回收集的数据，不再滚动回顶部
  return Array.from(collectedBlocks.entries())
    .sort(([idA], [idB]) => idA - idB)
    .reduce((container, [_, element]) => {
      container.appendChild(element);
      return container;
    }, tempContainer);
}
