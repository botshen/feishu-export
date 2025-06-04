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

  const clonedRoot = rootBlock.cloneNode(true) as HTMLElement;

  let renderUnitWrapper = clonedRoot.querySelector('.render-unit-wrapper');
  if (!renderUnitWrapper) {
    renderUnitWrapper = document.createElement('div');
    renderUnitWrapper.className = 'render-unit-wrapper';
    clonedRoot.appendChild(renderUnitWrapper);
  } else {
    renderUnitWrapper.innerHTML = '';
  }

  const container = document.querySelector('.bear-web-x-container.docx-in-wiki') as HTMLElement;
  if (!container) return null;

  const collectedBlocks = new Map<number, HTMLElement>();

  // 收集当前可见的块
  const collectVisibleBlocks = () => {
    const blocks = document.querySelectorAll('.render-unit-wrapper > div[data-block-id]');
    blocks.forEach(block => {
      const blockId = parseInt(block.getAttribute('data-block-id') || '0');
      if (blockId >= 2 && !collectedBlocks.has(blockId)) {
        collectedBlocks.set(blockId, block.cloneNode(true) as HTMLElement);
      }
    });
  };

  // 创建 MutationObserver 来监听新增的块
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.hasAttribute('data-block-id')) {
          const blockId = parseInt(node.getAttribute('data-block-id') || '0');
          if (blockId >= 2 && !collectedBlocks.has(blockId)) {
            collectedBlocks.set(blockId, node.cloneNode(true) as HTMLElement);
          }
        }
      });
    }
  });

  // 开始观察 render-unit-wrapper 的变化
  const originalWrapper = document.querySelector('.render-unit-wrapper');
  if (originalWrapper) {
    observer.observe(originalWrapper, {
      childList: true,
      subtree: true
    });
  }

  // 先收集当前视图中的块
  collectVisibleBlocks();

  // 先滚动到顶部
  container.scrollTo({
    top: 0,
    behavior: 'auto'
  });

  // 等待顶部内容加载并再次收集
  await new Promise(resolve => setTimeout(resolve, 200));
  collectVisibleBlocks();

  // 平滑滚动到底部
  return new Promise<HTMLElement>((resolve) => {
    let isScrolling = false;
    let lastScrollTop = container.scrollTop;
    let noChangeCount = 0;

    const scrollInterval = setInterval(async () => {
      if (!isScrolling) {
        isScrolling = true;
        const currentScrollTop = container.scrollTop;

        // 如果滚动位置没有变化，增加计数器
        if (currentScrollTop === lastScrollTop) {
          noChangeCount++;
        } else {
          noChangeCount = 0;
        }

        // 如果连续3次滚动位置没有变化，认为已到达底部
        if (noChangeCount >= 3) {
          clearInterval(scrollInterval);
          observer.disconnect();

          // 最后再收集一次，确保不遗漏
          collectVisibleBlocks();

          // 将收集到的块按顺序添加到克隆的 wrapper 中
          Array.from(collectedBlocks.entries())
            .sort(([idA], [idB]) => idA - idB)
            .forEach(([_, element]) => {
              renderUnitWrapper!.appendChild(element);
            });

          resolve(clonedRoot);
          return;
        }

        lastScrollTop = currentScrollTop;

        // 更快的滚动
        container.scrollBy({
          top: 500,
          behavior: 'auto'
        });

        // 等待内容加载并收集新的块
        await new Promise(resolve => setTimeout(resolve, 50));
        collectVisibleBlocks();
        isScrolling = false;
      }
    }, 100);
  });
}
