import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 60,
          height: 60,
          minWidth: 60,
          minHeight: 60,
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
          fontSize: "24px",
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
            marginTop: open ? "calc(50% - 24px)" : "0px",
            opacity: 1,
          }}
        >
          {open ? "×" : "💬"}
        </span>
      </button>

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 100,
          width: 400,
          height: 600,
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          boxShadow: "0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          overflow: "hidden",
          zIndex: 2147483000,
          display: "flex",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.95)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {open && <Chatbot embedded={true} />}
      </div>
    </>
  );
}
