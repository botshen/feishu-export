import { websiteMessenger } from "@/entrypoints/message/website-messaging";

export async function doInjectScript(action: "exportPdf" | "exportImage"): Promise<void> {
  const url = browser.runtime.getURL("/injected.js");
  console.log('url', url)
  // 检查脚本是否已经注入
  const existingScript = document.querySelector(`script[src="${url}"]`);
  console.log('existingScript', existingScript)
  if (existingScript) {
    // 如果脚本已存在，直接发送消息
    websiteMessenger.sendMessage(action, { 1: 1 });
    return;
  }

  // 如果脚本不存在，则注入新脚本
  const script = document.createElement("script");
  script.src = url;

  script.onload = () => {
    websiteMessenger.sendMessage(action, { 1: 1 });
  };

  (document.head ?? document.documentElement).append(script);
}