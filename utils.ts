export function injectScriptToPage() {
  const script = document.createElement('script')
  script.setAttribute('type', 'module')
  script.src = browser.runtime.getURL('/injected.js')


  script.onload = function () {
    // 脚本加载完成，但不一定执行完毕
    // 实际的准备就绪信号将由 injected-script-ready 事件提供
     script.remove()
  }

  document.documentElement.appendChild(script)
}