import { websiteMessenger } from "./message/website-messaging";

export default defineUnlistedScript(() => {

  websiteMessenger.onMessage('triggerExportImg', data => {
    // @ts-ignore
    console.error('window', window.PageMain)
    // eventually, send data back to the content script
  });
});