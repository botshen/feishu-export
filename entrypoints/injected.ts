export default defineUnlistedScript(() => {
  console.log("Hello from injected.ts=========");

  // 给所有图片添加 crossorigin 属性
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('crossorigin')) {
      img.setAttribute('crossorigin', 'anonymous');
    }
  });

  // 在页面中创建一个隐藏的元素，用于预加载图片
  // 这有助于在 html2pdf 处理时确保图片已被缓存
  const preloadContainer = document.createElement('div');
  preloadContainer.style.display = 'none';
  preloadContainer.id = 'pdf-preload-container';
  document.body.appendChild(preloadContainer);

  // 复制所有图片到预加载容器
  images.forEach(img => {
    const imgClone = document.createElement('img');
    imgClone.src = img.src;
    imgClone.setAttribute('crossorigin', 'anonymous');
    preloadContainer.appendChild(imgClone);
  });
});