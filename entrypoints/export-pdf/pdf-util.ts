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
  const rootBlock = document.querySelector('.root-block') as HTMLElement;
  if (!rootBlock) return null;

  // 克隆整个 root-block
  const clonedRoot = rootBlock.cloneNode(true) as HTMLElement;

  // 找到或创建 render-unit-wrapper
  let renderUnitWrapper = clonedRoot.querySelector('.render-unit-wrapper');
  if (!renderUnitWrapper) {
    renderUnitWrapper = document.createElement('div');
    renderUnitWrapper.className = 'render-unit-wrapper';
    clonedRoot.appendChild(renderUnitWrapper);
  } else {
    // 清空现有的 render-unit-wrapper 内容
    renderUnitWrapper.innerHTML = '';
  }

  const container = document.querySelector('.bear-web-x-container.docx-in-wiki') as HTMLElement;
  if (!container) return null;

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

  // 将收集到的块添加到 render-unit-wrapper 中
  Array.from(collectedBlocks.entries())
    .sort(([idA], [idB]) => idA - idB)
    .forEach(([_, element]) => {
      renderUnitWrapper!.appendChild(element);
    });

  return clonedRoot;
}
