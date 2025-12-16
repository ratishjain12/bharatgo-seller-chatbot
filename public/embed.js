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
    // Add smooth transitions
    btn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    var img = document.createElement("img");
    img.src = host + "/image.png";
    img.alt = "Open chat";
    img.style.objectFit = "cover";
    img.style.pointerEvents = "none";
    img.style.userSelect = "none";
    img.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    var closeEl = document.createElement("span");
    closeEl.textContent = "×";
    closeEl.style.display = "none";
    closeEl.style.color = "#ffffff";
    // Center the glyph perfectly regardless of font metrics
    closeEl.style.width = "100%";
    closeEl.style.height = "100%";
    closeEl.style.display = "none"; // toggled on open
    closeEl.style.alignItems = "center";
    closeEl.style.justifyContent = "center";
    closeEl.style.pointerEvents = "none";
    closeEl.style.display = "none";
    closeEl.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
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
    iframe.style.boxShadow =
      "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    iframe.style.overflow = "hidden";
    iframe.style.zIndex = String(Z);
    iframe.style.display = "none";
    iframe.style.border = "0";
    // Add smooth transitions for layout changes
    iframe.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    iframe.src = host + "/embed.html";
    document.body.appendChild(iframe);
    return iframe;
  }

  function getDeviceType() {
    var width = window.innerWidth;
    if (width <= 640) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  }

  function applyButtonSize(deviceType, refs) {
    var btn = refs.btn;
    var img = refs.img;
    var closeEl = refs.closeEl;

    if (deviceType === "mobile") {
      btn.style.width = "52px";
      btn.style.height = "52px";
      btn.style.minWidth = "52px";
      btn.style.minHeight = "52px";
      btn.style.right = "16px";
      btn.style.bottom = "16px";
      img.style.width = "52px";
      img.style.height = "52px";
      closeEl.style.fontSize = "22px";
    } else if (deviceType === "tablet") {
      btn.style.width = "56px";
      btn.style.height = "56px";
      btn.style.minWidth = "56px";
      btn.style.minHeight = "56px";
      btn.style.right = "20px";
      btn.style.bottom = "20px";
      img.style.width = "56px";
      img.style.height = "56px";
      closeEl.style.fontSize = "24px";
    } else {
      btn.style.width = "60px";
      btn.style.height = "60px";
      btn.style.minWidth = "60px";
      btn.style.minHeight = "60px";
      btn.style.right = "24px";
      btn.style.bottom = "24px";
      img.style.width = "60px";
      img.style.height = "60px";
      closeEl.style.fontSize = "26px";
    }
  }

  function calculateProportionalSize() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    // Base size for 1024px width (reference point)
    var baseWidth = 400;
    var baseHeight = 600;

    // Calculate proportional width (20-30% of viewport width, but with constraints)
    var widthPercent = Math.min(Math.max(viewportWidth * 0.25, 0.2), 0.3);
    var calculatedWidth = Math.round(viewportWidth * widthPercent);

    // Set min/max constraints for width
    var minWidth = 320;
    var maxWidth = 480;
    var width = Math.max(minWidth, Math.min(maxWidth, calculatedWidth));

    // Calculate proportional height (maintain aspect ratio, but with constraints)
    var aspectRatio = baseHeight / baseWidth; // 1.5
    var calculatedHeight = Math.round(width * aspectRatio);

    // Set min/max constraints for height (also consider viewport height)
    var minHeight = 480;
    var maxHeight = Math.min(720, Math.round(viewportHeight * 0.85));
    var height = Math.max(minHeight, Math.min(maxHeight, calculatedHeight));

    // Calculate bottom offset (proportional to viewport)
    var bottomOffset = Math.max(60, Math.round(viewportHeight * 0.1));

    // Calculate right offset (proportional to viewport width)
    var rightOffset = Math.max(16, Math.round(viewportWidth * 0.02));

    return {
      width: width + "px",
      height: height + "px",
      bottom: bottomOffset + "px",
      right: rightOffset + "px",
    };
  }

  function applyLayout(deviceType, iframe) {
    if (deviceType === "mobile") {
      iframe.style.right = "0";
      iframe.style.left = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "100%";
      iframe.style.height = "85vh";
      iframe.style.borderRadius = "16px 16px 0 0";
      iframe.style.boxShadow =
        "0 -8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    } else {
      // Tablet and Desktop: Use proportional scaling
      var sizes = calculateProportionalSize();
      iframe.style.left = "";
      iframe.style.right = sizes.right;
      iframe.style.bottom = sizes.bottom;
      iframe.style.width = sizes.width;
      iframe.style.height = sizes.height;
      iframe.style.borderRadius = "16px";
      iframe.style.boxShadow =
        "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)";
    }
  }

  function setOpenState(open, refs, deviceType) {
    var btn = refs.btn;
    var img = refs.img;
    var iframe = refs.iframe;
    var closeEl = refs.closeEl;
    if (open) {
      btn.style.borderRadius = "50%";
      btn.style.background =
        "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)";
      btn.style.color = "#ffffff";
      img.style.display = "none";
      closeEl.style.display = "flex";
      iframe.style.display = "block";
      if (deviceType === "mobile") {
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
    // Create media query listeners for mobile and tablet
    var mobileMql =
      window.matchMedia && window.matchMedia("(max-width: 640px)");
    var tabletMql =
      window.matchMedia &&
      window.matchMedia("(min-width: 641px) and (max-width: 1024px)");

    var deviceType = getDeviceType();
    var iframe = createIframe();
    applyLayout(deviceType, iframe);

    var parts = createButton();
    var refs = {
      btn: parts.btn,
      img: parts.img,
      closeEl: parts.closeEl,
      iframe: iframe,
    };
    applyButtonSize(deviceType, refs);

    var isOpen = false;
    parts.btn.addEventListener("click", function () {
      isOpen = !isOpen;
      setOpenState(isOpen, refs, deviceType);
    });
    document.body.appendChild(parts.btn);

    function handleResize() {
      var newDeviceType = getDeviceType();
      var deviceTypeChanged = newDeviceType !== deviceType;

      if (deviceTypeChanged) {
        deviceType = newDeviceType;
        applyButtonSize(deviceType, refs);
        if (isOpen) {
          setOpenState(true, refs, deviceType);
        }
      }

      // Always update layout for proportional scaling (even if device type didn't change)
      applyLayout(deviceType, iframe);
    }

    // Listen to mobile breakpoint changes
    if (mobileMql) {
      var mobileHandler = function (e) {
        if (e.matches) {
          deviceType = "mobile";
          applyLayout(deviceType, iframe);
          applyButtonSize(deviceType, refs);
          if (isOpen) setOpenState(true, refs, deviceType);
        } else {
          handleResize();
        }
      };
      if (typeof mobileMql.addEventListener === "function") {
        mobileMql.addEventListener("change", mobileHandler);
      } else if (typeof mobileMql.addListener === "function") {
        mobileMql.addListener(mobileHandler);
      }
    }

    // Listen to tablet breakpoint changes
    if (tabletMql) {
      var tabletHandler = function (e) {
        if (e.matches) {
          deviceType = "tablet";
          applyLayout(deviceType, iframe);
          applyButtonSize(deviceType, refs);
          if (isOpen) setOpenState(true, refs, deviceType);
        } else {
          handleResize();
        }
      };
      if (typeof tabletMql.addEventListener === "function") {
        tabletMql.addEventListener("change", tabletHandler);
      } else if (typeof tabletMql.addListener === "function") {
        tabletMql.addListener(tabletHandler);
      }
    }

    // Also listen to window resize for desktop transitions
    var resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });

    // Listen for close requests from inside the iframe
    window.addEventListener("message", function (ev) {
      var data = ev && ev.data;
      if (data && data.type === "BG_CHAT_CLOSE") {
        isOpen = false;
        setOpenState(false, refs, deviceType);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
