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

  const FIXED_HEADER_HEIGHT = 65;
  const viewportHeight = container.clientHeight - FIXED_HEADER_HEIGHT;
  const totalHeight = container.scrollHeight;
  const bannerHeight = 500;
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
  await new Promise(resolve => setTimeout(resolve, 300));
  collectVisibleBlocks();

  // Scroll and collect with overlap to ensure no content is missed
  let currentScroll = bannerHeight;
  const scrollStep = Math.floor(viewportHeight * 0.8);
  let lastCollectedSize = 0;
  let noNewBlocksCount = 0;

  while (currentScroll < totalHeight && noNewBlocksCount < 3) {
    currentScroll += scrollStep;
    container.scrollTo(0, currentScroll);

    // Wait for content to load with shorter delay
    await new Promise(resolve => setTimeout(resolve, 300));
    collectVisibleBlocks();

    if (collectedBlocks.size === lastCollectedSize) {
      noNewBlocksCount++;
    } else {
      noNewBlocksCount = 0;
      lastCollectedSize = collectedBlocks.size;
    }
  }

  // Scroll to bottom and collect final blocks
  container.scrollTo(0, totalHeight);
  // Use a dynamic waiting time based on the amount of new content
  const finalBlockCount = collectedBlocks.size;
  await new Promise(resolve => setTimeout(resolve, 500));
  collectVisibleBlocks();

  // If we found new blocks at the bottom, wait a bit more
  if (collectedBlocks.size > finalBlockCount) {
    await new Promise(resolve => setTimeout(resolve, 300));
    collectVisibleBlocks();
  }

  // Smooth scroll back to top with reduced wait time
  container.style.scrollBehavior = 'smooth';
  container.scrollTo(0, 0);
  container.style.scrollBehavior = 'auto';
  await new Promise(resolve => setTimeout(resolve, 300));

  // Sort blocks by data-block-id and append to tempContainer
  const sortedBlocks = Array.from(collectedBlocks.entries())
    .sort(([idA], [idB]) => idA - idB)
    .map(([_, element]) => element);

  sortedBlocks.forEach(block => tempContainer.appendChild(block));

  return tempContainer;
}
