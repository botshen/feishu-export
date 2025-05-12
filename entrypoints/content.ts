export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    console.log("Done!");
  },
});