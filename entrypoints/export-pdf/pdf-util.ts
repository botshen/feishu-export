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

export async function collectAllBlocks(block_sequence: string[]) {
  const container = document.querySelector('.bear-web-x-container.docx-in-wiki') as HTMLElement;
  if (!container) return null;

  // Create a temporary container to store all blocks
  const tempContainer = document.createElement('div');
  tempContainer.className = 'render-unit-wrapper';
  
  const viewportHeight = container.clientHeight;
  const totalHeight = container.scrollHeight;
  const bannerHeight = 400; // 顶部 banner 高度
  const collectedBlocks = new Set<string>();
  
  // Function to collect visible blocks
  const collectVisibleBlocks = () => {
    const blocks = document.querySelectorAll('[data-record-id]');
    blocks.forEach(block => {
      const recordId = block.getAttribute('data-record-id');
      if (recordId && block_sequence.includes(recordId) && !collectedBlocks.has(recordId)) {
        collectedBlocks.add(recordId);
        tempContainer.appendChild(block.cloneNode(true));
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
  
  while (currentScroll < totalHeight && collectedBlocks.size < block_sequence.length) {
    currentScroll += scrollStep;
    container.scrollTo(0, currentScroll);
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    collectVisibleBlocks();
  }

  // 最后再滚动到最底部确保收集完整
  container.scrollTo(0, totalHeight);
  await new Promise(resolve => setTimeout(resolve, 1000));
  collectVisibleBlocks();

  // Reset scroll position
  container.scrollTo(0, 0);
  
  return tempContainer;
}
