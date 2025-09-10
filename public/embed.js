(function () {
  if (window.__bharatgo_chat_loaded__) return;
  window.__bharatgo_chat_loaded__ = true;

  var BUTTON_SIZE = 56;
  var Z = 2147483000;
  var host =
    (document.currentScript &&
      document.currentScript.src &&
      new URL(document.currentScript.src).origin) ||
    window.location.origin;

  function createStyles() {
    var style = document.createElement("style");
    style.textContent =
      "\n      .bg-chat-fab {\n        position: fixed; right: 24px; bottom: 24px; width: " +
      BUTTON_SIZE +
      "px; height: " +
      BUTTON_SIZE +
      "px;\n        border-radius: 50%; background: #3b82f6; color: white; border: none;\n        box-shadow: 0 8px 24px rgba(0,0,0,0.15); cursor: pointer; z-index: " +
      Z +
      ";\n      }\n      .bg-chat-iframe {\n        position: fixed; right: 24px; bottom: " +
      (BUTTON_SIZE + 36) +
      "px; width: 380px; height: 520px;\n        border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 24px 48px rgba(0,0,0,0.2);\n        overflow: hidden; z-index: " +
      Z +
      "; background: white; display: none;\n      }\n    ";
    document.head.appendChild(style);
  }

  function createButton(toggle) {
    var btn = document.createElement("button");
    btn.className = "bg-chat-fab";
    btn.setAttribute("aria-label", "Open chat");
    btn.textContent = "💬";
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    return btn;
  }

  function createIframe() {
    var iframe = document.createElement("iframe");
    iframe.className = "bg-chat-iframe";
    iframe.src = host + "/embed.html";
    iframe.title = "Chatbot";
    iframe.allow = "clipboard-read; clipboard-write";
    document.body.appendChild(iframe);
    return iframe;
  }

  function main() {
    createStyles();
    var isOpen = false;
    var iframe = createIframe();
    var button = createButton(function () {
      isOpen = !isOpen;
      iframe.style.display = isOpen ? "block" : "none";
      button.textContent = isOpen ? "×" : "💬";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
