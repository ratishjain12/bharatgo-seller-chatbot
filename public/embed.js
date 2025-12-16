(function () {
  if (window.__bharatgo_chat_loaded__) return;
  window.__bharatgo_chat_loaded__ = true;

  var Z = 2147483000;
  var host =
    (document.currentScript &&
      document.currentScript.src &&
      new URL(document.currentScript.src).origin) ||
    window.location.origin;

  function getStoredButtonPosition() {
    try {
      var stored = localStorage.getItem("bharatgo-chat-button-position");
      if (stored) {
        var pos = JSON.parse(stored);
        return { x: pos.x, y: pos.y };
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  function saveButtonPosition(x, y) {
    try {
      localStorage.setItem(
        "bharatgo-chat-button-position",
        JSON.stringify({ x: x, y: y })
      );
    } catch (e) {
      // ignore
    }
  }

  function createButton() {
    var btn = document.createElement("button");
    btn.setAttribute("aria-label", "Open chat");
    btn.style.position = "fixed";
    btn.style.border = "none";
    btn.style.borderRadius = "0"; // closed state uses image only
    btn.style.background = "transparent";
    btn.style.cursor = "move";
    btn.style.zIndex = String(Z);
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "0";
    btn.style.margin = "0";
    btn.style.outline = "none";
    // Add smooth transitions (but disable during drag)
    btn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // Load saved position or use default
    var savedPos = getStoredButtonPosition();
    if (savedPos) {
      btn.style.right = "auto";
      btn.style.bottom = "auto";
      btn.style.left = savedPos.x + "px";
      btn.style.top = savedPos.y + "px";
    } else {
      btn.style.right = "24px";
      btn.style.bottom = "24px";
    }

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
    iframe.style.pointerEvents = "auto"; // Allow interactions when visible
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

    // Check if button has a saved position (using left/top instead of right/bottom)
    var hasSavedPosition = btn.style.left && btn.style.left !== "auto";

    if (deviceType === "mobile") {
      btn.style.width = "52px";
      btn.style.height = "52px";
      btn.style.minWidth = "52px";
      btn.style.minHeight = "52px";
      if (!hasSavedPosition) {
        btn.style.right = "16px";
        btn.style.bottom = "16px";
        btn.style.left = "auto";
        btn.style.top = "auto";
      }
      img.style.width = "52px";
      img.style.height = "52px";
      closeEl.style.fontSize = "22px";
    } else if (deviceType === "tablet") {
      btn.style.width = "56px";
      btn.style.height = "56px";
      btn.style.minWidth = "56px";
      btn.style.minHeight = "56px";
      if (!hasSavedPosition) {
        btn.style.right = "20px";
        btn.style.bottom = "20px";
        btn.style.left = "auto";
        btn.style.top = "auto";
      }
      img.style.width = "56px";
      img.style.height = "56px";
      closeEl.style.fontSize = "24px";
    } else {
      btn.style.width = "60px";
      btn.style.height = "60px";
      btn.style.minWidth = "60px";
      btn.style.minHeight = "60px";
      if (!hasSavedPosition) {
        btn.style.right = "24px";
        btn.style.bottom = "24px";
        btn.style.left = "auto";
        btn.style.top = "auto";
      }
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
      iframe.style.pointerEvents = "auto"; // Allow interactions
      if (deviceType === "mobile") {
        btn.style.display = "none";
      }
    } else {
      btn.style.borderRadius = "0";
      btn.style.background = "transparent";
      closeEl.style.display = "none";
      img.style.display = "block";
      iframe.style.display = "none";
      iframe.style.pointerEvents = "none"; // Prevent interactions when hidden
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
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var buttonStartX = 0;
    var buttonStartY = 0;
    var clickStartTime = 0;
    var hasMoved = false;
    var dragTimeout = null;

    // Make button draggable
    function startDrag(e) {
      if (deviceType === "mobile") {
        // On mobile, just toggle on click
        isOpen = !isOpen;
        setOpenState(isOpen, refs, deviceType);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      hasMoved = false;
      clickStartTime = Date.now();

      var btn = parts.btn;
      var rect = btn.getBoundingClientRect();
      buttonStartX = rect.left;
      buttonStartY = rect.top;

      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragStartX = clientX;
      dragStartY = clientY;

      btn.style.transition = "none";
      btn.style.cursor = "grabbing";

      // Set a timeout to distinguish click from drag
      dragTimeout = setTimeout(function () {
        if (isDragging) {
          hasMoved = true; // Prevent click if user holds for too long
        }
      }, 150);

      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", handleDrag);
      document.addEventListener("touchend", endDrag);
    }

    function handleDrag(e) {
      if (!isDragging) return;

      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;

      var deltaX = clientX - dragStartX;
      var deltaY = clientY - dragStartY;

      // Check if user actually moved (not just a click)
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          dragTimeout = null;
        }
      }

      var newX = buttonStartX + deltaX;
      var newY = buttonStartY + deltaY;

      // Constrain to viewport
      var btn = parts.btn;
      var btnWidth = btn.offsetWidth;
      var btnHeight = btn.offsetHeight;
      var maxX = window.innerWidth - btnWidth;
      var maxY = window.innerHeight - btnHeight;

      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));

      btn.style.right = "auto";
      btn.style.bottom = "auto";
      btn.style.left = newX + "px";
      btn.style.top = newY + "px";
    }

    function endDrag(e) {
      if (!isDragging) return;

      var wasDragging = isDragging;
      isDragging = false;

      if (dragTimeout) {
        clearTimeout(dragTimeout);
        dragTimeout = null;
      }

      var btn = parts.btn;
      btn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      btn.style.cursor = "move";

      // Save position if moved
      if (hasMoved) {
        var rect = btn.getBoundingClientRect();
        saveButtonPosition(rect.left, rect.top);
      }

      // If user didn't move much and time was short, treat as click
      var clickDuration = Date.now() - clickStartTime;
      if (!hasMoved && clickDuration < 200 && wasDragging) {
        isOpen = !isOpen;
        setOpenState(isOpen, refs, deviceType);
      }

      // Reset for next interaction
      hasMoved = false;
      clickStartTime = 0;

      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", handleDrag);
      document.removeEventListener("touchend", endDrag);
    }

    // Add drag handlers
    parts.btn.addEventListener("mousedown", startDrag);
    parts.btn.addEventListener("touchstart", startDrag);

    document.body.appendChild(parts.btn);

    // Click outside to close
    document.addEventListener("click", function (e) {
      if (!isOpen) return;

      var target = e.target;
      var btn = parts.btn;
      var chatIframe = refs.iframe;

      // Check if click is outside both button and iframe
      var clickedOnButton = btn.contains(target);
      var clickedOnIframe = chatIframe.contains && chatIframe.contains(target);

      // Also check if click is within iframe bounds (for cross-origin iframes)
      var iframeRect = chatIframe.getBoundingClientRect();
      var clickInIframeBounds =
        e.clientX >= iframeRect.left &&
        e.clientX <= iframeRect.right &&
        e.clientY >= iframeRect.top &&
        e.clientY <= iframeRect.bottom;

      if (!clickedOnButton && !clickedOnIframe && !clickInIframeBounds) {
        isOpen = false;
        setOpenState(false, refs, deviceType);
      }
    });

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
