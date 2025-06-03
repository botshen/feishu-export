export function injectScriptToPage() {
  const script = document.createElement('script')
  script.setAttribute('type', 'module')
  script.src = browser.runtime.getURL('/injected.js')


  script.onload = function () {
     script.remove()
  }

  document.documentElement.appendChild(script)
}