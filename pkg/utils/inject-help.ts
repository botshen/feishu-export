import { websiteMessenger } from "@/entrypoints/message/website-messaging";

export async function doInjectScript(): Promise<void> {
  const url = browser.runtime.getURL("/injected.js");
  const script = document.createElement("script");

  script.src = url;

  script.onload = () => {
     websiteMessenger.sendMessage("exportPdf", { 1: 1 });
  };

  (document.head ?? document.documentElement).append(script);
}