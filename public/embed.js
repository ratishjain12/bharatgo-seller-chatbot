(function () {
  if (window.__bharatgo_chat_loaded__) return;
  window.__bharatgo_chat_loaded__ = true;

  var Z = 2147483000;
  var host =
    (document.currentScript &&
      document.currentScript.src &&
      new URL(document.currentScript.src).origin) ||
    window.location.origin;

  function createButton() {
    var btn = document.createElement("button");
    btn.setAttribute("aria-label", "Open chat");
    btn.style.position = "fixed";
    btn.style.right = "24px";
    btn.style.bottom = "24px";
    btn.style.width = "60px";
    btn.style.height = "60px";
    btn.style.minWidth = "60px";
    btn.style.minHeight = "60px";
    btn.style.border = "none";
    btn.style.borderRadius = "0"; // closed state uses image only
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    btn.style.zIndex = String(Z);
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "0";
    btn.style.margin = "0";
    btn.style.outline = "none";

    var img = document.createElement("img");
    img.src = host + "/image.png";
    img.alt = "Open chat";
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.objectFit = "cover";
    img.style.pointerEvents = "none";
    img.style.userSelect = "none";
    var closeEl = document.createElement("span");
    closeEl.textContent = "×";
    closeEl.style.display = "none";
    closeEl.style.fontSize = "26px";
    closeEl.style.color = "#ffffff";
    // Center the glyph perfectly regardless of font metrics
    closeEl.style.width = "100%";
    closeEl.style.height = "100%";
    closeEl.style.display = "none"; // toggled on open
    closeEl.style.alignItems = "center";
    closeEl.style.justifyContent = "center";
    closeEl.style.pointerEvents = "none";
    closeEl.style.display = "none";
    btn.appendChild(img);
    btn.appendChild(closeEl);

    return { btn: btn, img: img, closeEl: closeEl };
  }

  function createIframe() {
    var iframe = document.createElement("iframe");
    iframe.title = "Chatbot";
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.style.position = "fixed";
    iframe.style.right = "24px";
    iframe.style.bottom = "100px";
    iframe.style.width = "400px";
    iframe.style.height = "600px";
    iframe.style.background = "transparent";
    iframe.style.borderRadius = "16px";
    iframe.style.boxShadow = "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    iframe.style.overflow = "hidden";
    iframe.style.zIndex = String(Z);
    iframe.style.display = "none";
    iframe.style.border = "0";
    iframe.src = host + "/embed.html";
    document.body.appendChild(iframe);
    return iframe;
  }

  function applyMobileLayout(isMobile, iframe) {
    if (isMobile) {
      iframe.style.right = "0";
      iframe.style.left = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "100%";
      iframe.style.height = "85vh";
      iframe.style.borderRadius = "16px 16px 0 0";
      iframe.style.boxShadow = "0 -8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    } else {
      iframe.style.left = "";
      iframe.style.right = "24px";
      iframe.style.bottom = "100px";
      iframe.style.width = "400px";
      iframe.style.height = "600px";
      iframe.style.borderRadius = "16px";
      iframe.style.boxShadow = "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    }
  }

  function setOpenState(open, refs, isMobile) {
    var btn = refs.btn;
    var img = refs.img;
    var iframe = refs.iframe;
    var closeEl = refs.closeEl;
    if (open) {
      btn.style.borderRadius = "50%";
      btn.style.background = "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)";
      btn.style.color = "#ffffff";
      img.style.display = "none";
      closeEl.style.display = "flex";
      closeEl.style.fontSize = isMobile ? "24px" : "26px";
      iframe.style.display = "block";
      if (isMobile) {
        btn.style.display = "none";
      }
    } else {
      btn.style.borderRadius = "0";
      btn.style.background = "transparent";
      closeEl.style.display = "none";
      img.style.display = "block";
      iframe.style.display = "none";
      // Always show button when closed
      btn.style.display = "flex";
      btn.style.visibility = "visible";
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
      btn.style.transform = "scale(1)";
      btn.style.zIndex = String(Z);
    }
  }

  function main() {
    var mql = window.matchMedia && window.matchMedia("(max-width: 640px)");
    var isMobile = !!(mql && mql.matches);
    var iframe = createIframe();
    applyMobileLayout(isMobile, iframe);

    var parts = createButton();
    var refs = { btn: parts.btn, img: parts.img, closeEl: parts.closeEl, iframe: iframe };

    var isOpen = false;
    parts.btn.addEventListener("click", function () {
      isOpen = !isOpen;
      setOpenState(isOpen, refs, isMobile);
    });
    document.body.appendChild(parts.btn);

    if (mql) {
      var handler = function (e) {
        isMobile = e.matches;
        applyMobileLayout(isMobile, iframe);
        if (isOpen) setOpenState(true, refs, isMobile);
      };
      if (typeof mql.addEventListener === "function") mql.addEventListener("change", handler);
      else if (typeof mql.addListener === "function") mql.addListener(handler);
    }

    // Listen for close requests from inside the iframe
    window.addEventListener("message", function (ev) {
      var data = ev && ev.data;
      if (data && data.type === "BG_CHAT_CLOSE") {
        isOpen = false;
        setOpenState(false, refs, isMobile);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
