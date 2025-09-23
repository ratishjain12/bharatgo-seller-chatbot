import { useEffect, useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // Safari <14 support
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
    } else {
      mql.addListener(handler);
    }
    setIsMobile(mql.matches);
    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  return (
    <>
      {/* Floating Button */}
      {!(open && isMobile) && (
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: isMobile ? 16 : 24,
          bottom: isMobile ? 16 : 24,
          width: isMobile ? 52 : 60,
          height: isMobile ? 52 : 60,
          minWidth: isMobile ? 52 : 60,
          minHeight: isMobile ? 52 : 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          boxShadow:
            "0 8px 32px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          cursor: "pointer",
          zIndex: 2147483000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? "22px" : "24px",
          fontWeight: "normal",
          lineHeight: 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "rotate(0deg)",
          padding: 0,
          margin: 0,
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 12px 40px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255,255,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 8px 32px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1)";
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            marginTop: open ? (isMobile ? "calc(50% - 22px)" : "calc(50% - 24px)") : "0px",
            opacity: 1,
          }}
        >
          {open ? "×" : "💬"}
        </span>
      </button>
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          right: isMobile ? 0 : 24,
          bottom:  isMobile ? 0 : 100,
          left:   isMobile ? 0 : undefined,
          top:    isMobile ? undefined : undefined,
          width:  isMobile ? "100%" : 400,
          height: isMobile ? "85vh" : 600,
          background: "#ffffff",
          borderRadius: isMobile ? "16px 16px 0 0" : 16,
          boxShadow: isMobile
            ? "0 -8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)"
            : "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          overflow: "hidden",
          zIndex: 2147483000,
          display: "flex",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.95)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: isMobile ? "none" : "blur(20px)",
        }}
      >
        {open && <Chatbot embedded={true} onClose={() => setOpen(false)} />}
      </div>
    </>
  );
}
