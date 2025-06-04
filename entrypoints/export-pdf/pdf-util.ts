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

  // Create a temporary container to store all blocks
  const tempContainer = document.createElement('div');
  tempContainer.className = 'render-unit-wrapper';

  const FIXED_HEADER_HEIGHT = 65; // 固定任务栏高度
  const viewportHeight = container.clientHeight - FIXED_HEADER_HEIGHT;
  const totalHeight = container.scrollHeight;
  const bannerHeight = 500; // 顶部 banner 高度
  const collectedBlocks = new Map<number, HTMLElement>();

  // Function to collect visible blocks
  const collectVisibleBlocks = () => {
    const blocks = document.querySelectorAll('.render-unit-wrapper > div[data-block-id]');
    blocks.forEach(block => {
      const blockId = parseInt(block.getAttribute('data-block-id') || '0');
      if (blockId >= 2 && !collectedBlocks.has(blockId)) {
        collectedBlocks.set(blockId, block.cloneNode(true) as HTMLElement);
      }
    });
  };

  // Initial collection after scrolling past banner
  container.scrollTo(0, bannerHeight);
  await new Promise(resolve => setTimeout(resolve, 1000));
  collectVisibleBlocks();

  // Scroll and collect with overlap to ensure no content is missed
  let currentScroll = bannerHeight;
  const scrollStep = Math.floor(viewportHeight * 0.8); // 使用 80% 视口高度作为滚动步长，确保有重叠
  let lastCollectedSize = 0;
  let noNewBlocksCount = 0;

  while (currentScroll < totalHeight && noNewBlocksCount < 3) {
    currentScroll += scrollStep;
    container.scrollTo(0, currentScroll);

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    collectVisibleBlocks();

    // Check if we found any new blocks
    if (collectedBlocks.size === lastCollectedSize) {
      noNewBlocksCount++;
    } else {
      noNewBlocksCount = 0;
      lastCollectedSize = collectedBlocks.size;
    }
  }

  // 确保滚动到真正的底部并等待足够长的时间
  container.scrollTo(0, totalHeight);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 增加等待时间
  collectVisibleBlocks();

  // 平滑地滚动回顶部
  container.style.scrollBehavior = 'smooth';
  container.scrollTo(0, 0);
  container.style.scrollBehavior = 'auto';
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Sort blocks by data-block-id and append to tempContainer
  const sortedBlocks = Array.from(collectedBlocks.entries())
    .sort(([idA], [idB]) => idA - idB)
    .map(([_, element]) => element);

  sortedBlocks.forEach(block => tempContainer.appendChild(block));

  return tempContainer;
}
