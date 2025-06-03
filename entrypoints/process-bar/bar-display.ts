/**
 * 创建不受页面缩放影响的进度显示
 */
export function createProgressDisplay() {
  // 创建一个固定在右上角的div元素
  const container = document.createElement('div');
  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '320px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: '#333',
    padding: '20px',
    borderRadius: '16px',
    zIndex: '99999999',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    transformOrigin: 'top right',
    transform: 'scale(1)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease-in-out',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
  };

  Object.assign(container.style, styles);

  // 创建图标和标题容器
  const headerContainer = document.createElement('div');
  headerContainer.style.display = 'flex';
  headerContainer.style.alignItems = 'center';
  headerContainer.style.marginBottom = '16px';
  container.appendChild(headerContainer);

  // 创建PDF图标
  const iconContainer = document.createElement('div');
  iconContainer.style.marginRight = '12px';
  iconContainer.style.display = 'flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.width = '32px';
  iconContainer.style.height = '32px';
  iconContainer.style.borderRadius = '8px';
  iconContainer.style.backgroundColor = '#1E88E5';
  iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
    <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6Z" fill="white"/>
    <path d="M14 10L16 10L12 6L8 10L10 10L10 14L14 14L14 10Z" fill="white"/>
  </svg>`;
  headerContainer.appendChild(iconContainer);

  // 创建标题
  const title = document.createElement('div');
  title.style.fontWeight = '600';
  title.style.fontSize = '16px';
  title.style.color = '#1E88E5';
  title.textContent = '正在导出飞书文档';
  headerContainer.appendChild(title);

  // 创建当前项目信息
  const current = document.createElement('div');
  current.style.marginBottom = '12px';
  current.style.fontSize = '14px';
  current.style.fontWeight = '500';
  current.style.color = '#424242';
  current.textContent = '准备中...';
  container.appendChild(current);

  // 创建进度条容器
  const progressContainer = document.createElement('div');
  progressContainer.style.width = '100%';
  progressContainer.style.backgroundColor = 'rgba(245, 245, 245, 0.3)';
  progressContainer.style.height = '8px';
  progressContainer.style.borderRadius = '6px';
  progressContainer.style.overflow = 'hidden';
  progressContainer.style.marginBottom = '10px';
  progressContainer.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
  container.appendChild(progressContainer);

  // 创建进度条
  const progressBar = document.createElement('div');
  progressBar.style.height = '100%';
  progressBar.style.backgroundImage = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)';
  progressBar.style.width = '0%';
  progressBar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  progressBar.style.borderRadius = '6px';
  progressBar.style.position = 'relative';
  progressBar.style.overflow = 'hidden';
  progressContainer.appendChild(progressBar);

  // 添加进度条光效
  const progressShine = document.createElement('div');
  progressShine.style.position = 'absolute';
  progressShine.style.top = '0';
  progressShine.style.left = '-100%';
  progressShine.style.width = '50%';
  progressShine.style.height = '100%';
  progressShine.style.background = 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)';
  progressShine.style.animation = 'shine 1.5s infinite';
  progressBar.appendChild(progressShine);

  // 创建状态文本
  const status = document.createElement('div');
  status.style.display = 'flex';
  status.style.justifyContent = 'space-between';
  status.style.fontSize = '13px';
  status.style.color = '#757575';
  container.appendChild(status);

  // 左侧状态文本
  const statusTextElem = document.createElement('div');
  statusTextElem.textContent = '初始化中...';
  status.appendChild(statusTextElem);

  // 右侧百分比
  const percentText = document.createElement('div');
  percentText.textContent = '0%';
  percentText.style.fontWeight = '600';
  status.appendChild(percentText);

  // 动画效果的小点
  const pulseEffect = document.createElement('div');
  pulseEffect.style.position = 'absolute';
  pulseEffect.style.bottom = '12px';
  pulseEffect.style.right = '12px';
  pulseEffect.style.width = '8px';
  pulseEffect.style.height = '8px';
  pulseEffect.style.borderRadius = '50%';
  pulseEffect.style.backgroundColor = '#4CAF50';
  pulseEffect.style.animation = 'pulse 1.5s infinite';

  // 添加脉冲动画关键帧
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6);
        transform: scale(1);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(99, 102, 241, 0);
        transform: scale(1.1);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        transform: scale(1);
      }
    }
    @keyframes shine {
      0% {
        left: -100%;
      }
      100% {
        left: 200%;
      }
    }
  `;
  document.head.appendChild(style);
  container.appendChild(pulseEffect);

  document.body.appendChild(container);

  // 返回控制对象
  return {
    element: container,
    updateProgress: (currItem: number, total: number, title: string, statusText: string) => {
      const progress = Math.round((currItem / total) * 100);
      current.textContent = `正在处理: ${currItem}/${total} - ${title}`;
      progressBar.style.width = `${progress}%`;
      percentText.textContent = `${progress}%`;

      // 更改图标背景颜色以反映进度
      if (progress < 30) {
        iconContainer.style.backgroundColor = '#1E88E5'; // 蓝色
      } else if (progress < 70) {
        iconContainer.style.backgroundColor = '#7E57C2'; // 紫色
      } else {
        iconContainer.style.backgroundColor = '#43A047'; // 绿色
      }

      // 更新状态文本
      statusTextElem.textContent = statusText;
    },
    setComplete: (total: number) => {
      // 改变整个容器的样式
      container.style.background = 'linear-gradient(135deg, rgba(220, 252, 231, 0.7) 0%, rgba(209, 250, 229, 0.5) 100%)';
      container.style.borderColor = 'rgba(167, 243, 208, 0.3)';

      // 更新图标和标题
      iconContainer.style.backgroundColor = '#10B981';
      iconContainer.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
      iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="white"/>
      </svg>`;

      title.textContent = '导出完成！';
      title.style.color = '#43A047';

      current.textContent = `已处理: ${total}/${total} 个文档`;
      progressBar.style.width = '100%';
      progressBar.style.backgroundImage = 'linear-gradient(135deg, #34D399 0%, #10B981 100%)';
      statusTextElem.textContent = '所有PDF已导出';
      percentText.textContent = '100%';

      // 更改脉冲点的颜色和停止动画
      pulseEffect.style.backgroundColor = '#43A047';
      pulseEffect.style.animation = 'none';
      pulseEffect.style.boxShadow = '0 0 0 4px rgba(67, 160, 71, 0.3)';

      // 更改进度条样式
      progressBar.style.backgroundImage = 'linear-gradient(135deg, #34D399 0%, #10B981 100%)';
    },
    remove: () => {
      style.remove();
      container.style.opacity = '0';
      container.style.transform = 'translateY(-20px) scale(0.95)';
      setTimeout(() => container.remove(), 300);
    },
    updateScaling: (zoomFactor: number) => {
      // 当页面缩放为0.01时，放大5倍使进度条更明显
      container.style.transform = zoomFactor <= 0.01 ? 'scale(5)' : 'scale(1)';
      // 缩放时调整位置，避免超出视图
      if (zoomFactor <= 0.01) {
        container.style.right = '50px';
        container.style.top = '50px';
      } else {
        container.style.right = '20px';
        container.style.top = '20px';
      }
    }
  };
}