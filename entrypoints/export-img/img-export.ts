// @ts-ignore
import { snapdom } from "@zumer/snapdom";

export async function exportToImg() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  // 直接从 Canvas 获取图像数据
  const dataURL = canvas.toDataURL('image/jpeg', 1.0);

  // 创建下载链接
  const link = document.createElement('a');
  link.download = 'my-capture.jpg';
  link.href = dataURL;
  link.click();
}