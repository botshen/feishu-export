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

/**
 * 将块中的 canvas 元素转换为图片
 */
function convertCanvasToImage(element: HTMLElement): void {
  const canvases = element.getElementsByTagName('canvas');
  console.log(`找到 ${canvases.length} 个 canvas 元素`);

  Array.from(canvases).forEach((canvas, index) => {
    try {
      console.log(`开始处理第 ${index + 1} 个 canvas:`);
      console.log('原始 canvas 尺寸:', {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height
      });

      // 创建一个新的 canvas 来处理背景
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        console.error('无法获取临时 canvas 的上下文');
        return;
      }

      // 设置临时 canvas 的尺寸
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      console.log('临时 canvas 尺寸设置为:', {
        width: tempCanvas.width,
        height: tempCanvas.height
      });

      // 填充白色背景
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      console.log('已填充白色背景');

      // 获取原始 canvas 的内容信息
      try {
        const originalCtx = canvas.getContext('2d');
        if (originalCtx) {
          const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
          console.log('原始 canvas 数据:', {
            dataLength: imageData.data.length,
            hasData: imageData.data.some(val => val !== 0)
          });
        }
      } catch (e) {
        console.warn('无法读取原始 canvas 数据:', e);
      }

      // 将原始 canvas 内容绘制到临时 canvas 上
      tempCtx.drawImage(canvas, 0, 0);
      console.log('已将原始内容绘制到临时 canvas');

      // 检查临时 canvas 是否有内容
      try {
        const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        console.log('临时 canvas 数据:', {
          dataLength: tempImageData.data.length,
          hasData: tempImageData.data.some(val => val !== 255) // 255 是白色
        });
      } catch (e) {
        console.warn('无法读取临时 canvas 数据:', e);
      }

      // 从临时 canvas 生成图片
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 1.0);
      console.log('生成的图片 URL 长度:', dataUrl.length);

      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.width = canvas.style.width || `${canvas.width}px`;
      img.style.height = canvas.style.height || `${canvas.height}px`;
      console.log('创建的图片元素尺寸:', {
        width: img.style.width,
        height: img.style.height
      });

      canvas.parentNode?.replaceChild(img, canvas);
      console.log('已完成 canvas 到图片的转换');
    } catch (error) {
      console.error(`转换第 ${index + 1} 个 canvas 到图片失败:`, error);
    }
  });
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

  // 处理块中的 canvas
  const processBlockCanvas = async (block: HTMLElement): Promise<void> => {
    const canvases = block.getElementsByTagName('canvas');
    if (canvases.length === 0) return;

    console.log(`在块中找到 ${canvases.length} 个 canvas`);
    for (const canvas of Array.from(canvases)) {
      try {
        // 等待一小段时间确保 canvas 渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('canvas 尺寸:', {
          width: canvas.width,
          height: canvas.height
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.width = canvas.style.width || `${canvas.width}px`;
        img.style.height = canvas.style.height || `${canvas.height}px`;
        canvas.parentNode?.replaceChild(img, canvas);
        console.log('已将 canvas 转换为图片');
      } catch (error) {
        console.error('转换 canvas 到图片失败:', error);
      }
    }
  };

  // 收集当前可见的块
  const collectVisibleBlocks = async () => {
    const blocks = document.querySelectorAll('.render-unit-wrapper > div[data-block-id]');
    for (const block of Array.from(blocks)) {
      const blockId = parseInt(block.getAttribute('data-block-id') || '0');
      if (blockId >= 2 && !collectedBlocks.has(blockId)) {
        // 先处理原始块中的 canvas
        await processBlockCanvas(block as HTMLElement);
        // 然后克隆处理后的块
        collectedBlocks.set(blockId, block.cloneNode(true) as HTMLElement);
      }
    }
  };

  // 创建 MutationObserver 来监听新增的块
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof HTMLElement && node.hasAttribute('data-block-id')) {
          const blockId = parseInt(node.getAttribute('data-block-id') || '0');
          if (blockId >= 2 && !collectedBlocks.has(blockId)) {
            // 先处理新增块中的 canvas
            await processBlockCanvas(node);
            // 然后克隆处理后的块
            collectedBlocks.set(blockId, node.cloneNode(true) as HTMLElement);
          }
        }
      }
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

          // 等待一段时间确保内容渲染完成
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 处理所有收集到的块中的 canvas
          console.log('开始处理所有块中的 canvas');
          const allBlocks = renderUnitWrapper.querySelectorAll('div[data-block-id]');
          allBlocks.forEach(block => {
            convertCanvasToImage(block as HTMLElement);
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
