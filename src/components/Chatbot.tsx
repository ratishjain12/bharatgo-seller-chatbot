import { useMemo, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { sendChatQuestion } from "../lib/chatApi";
import {
  setStoredUserInfo,
  getStoredChatHistory,
  addStoredChatMessage,
} from "../helpers/session";
import type { Message } from "../types";

export default function Chatbot({ embedded = false, onClose }: { embedded?: boolean; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    return getStoredChatHistory() as Message[];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userError, setUserError] = useState<string | null>(null);
  const [userFieldErrors, setUserFieldErrors] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const userModalTimerRef = useRef<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    addStoredChatMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendChatQuestion(trimmed);
      if (res.requiresUserInfo) {
        if (userModalTimerRef.current)
          window.clearTimeout(userModalTimerRef.current);
        userModalTimerRef.current = window.setTimeout(() => {
          setShowUserModal(true);
        }, 2000);
      }
      const normalizeMarkdown = (text: string) =>
        text.replace(/^[\t ]*[•\u2022][\t ]?/gm, "- ").replace(/\r\n/g, "\n");
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer
          ? normalizeMarkdown(res.answer)
          : "No answer returned.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      addStoredChatMessage(assistantMessage);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: `Error: ${errorMessage}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
      addStoredChatMessage(errorMsg); // Save to storage
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    const name = userName.trim();
    const email = userEmail.trim();
    const phone = userPhone.trim();

    const nextErrors = {
      name: !name,
      email: !email,
      phone: !phone,
    };
    setUserFieldErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      setUserError("All fields are required.");
      return;
    }

    try {
      setStoredUserInfo({ name, email, phone });
      setShowUserModal(false);
      const savedMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hi ${name}, how can I help you today?`,
      };
      setMessages((prev) => [...prev, savedMessage]);
      addStoredChatMessage(savedMessage);
    } catch {
      setUserError("Could not save details. Try again.");
    }
  };

  const placeholder = useMemo(
    () => (isLoading ? "Waiting for response..." : "Ask something..."),
    [isLoading]
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (userModalTimerRef.current)
        window.clearTimeout(userModalTimerRef.current);
    };
  }, []);

  const isSmallViewport = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 640px)").matches;

  return (
    <div
      style={{
        height: embedded ? "100%" : isSmallViewport ? "100vh" : 540,
        width: embedded ? "100%" : "100%",
        maxWidth: embedded ? undefined : isSmallViewport ? "100%" : 720,
        margin: embedded ? 0 : isSmallViewport ? 0 : "24px auto",
        border: "none",
        borderRadius: embedded ? 0 : isSmallViewport ? 0 : 12,
        boxShadow: embedded ? "none" : isSmallViewport ? "none" : "0 12px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      <style>
        {`@keyframes bg-typing-bounce { 0%, 80%, 100% { transform: scale(0); opacity: .4 } 40% { transform: scale(1); opacity: 1 } }`}
      </style>
      <style>
        {`@keyframes bg-spin { to { transform: rotate(360deg); } }`}
      </style>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🚀</span>
          BharatGo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoading && (
          <div
            style={{
              fontSize: 12,
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "white",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "white",
                animation: "pulse 1.5s ease-in-out infinite 0.2s",
              }}
            ></div>
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "white",
                animation: "pulse 1.5s ease-in-out infinite 0.4s",
              }}
            ></div>
          </div>
          )}
          {embedded && onClose && (
            <button
              type="button"
              aria-label="Close chat"
              onClick={onClose}
              style={{
                marginLeft: 8,
                border: "none",
                background: "transparent",
                color: "white",
                fontSize: 20,
                borderRadius: 8,
                padding: 6,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          padding: "16px 20px",
          overflowY: "auto",
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              color: "#64748b",
              textAlign: "center",
              padding: "40px 20px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            👋 Welcome to BharatGo!
            <br />
            Ask me anything about our services.
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)"
                        : m.role === "assistant"
                        ? "#ffffff"
                        : "#fef3c7",
                    color: m.role === "user" ? "white" : "#1f2937",
                    padding: "12px 16px",
                    borderRadius: 16,
                    textAlign: "left",
                    boxShadow:
                      m.role === "assistant"
                        ? "0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)"
                    : "0 2px 8px rgba(59, 130, 246, 0.3)",
                    border:
                      m.role === "assistant"
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none",
                  }}
                >
                  {m.role === "assistant" || m.role === "system" ? (
                    <div
                      style={{
                        color: "black",
                        background: "transparent",
                        textAlign: "left",
                      }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ children }) => (
                            <p style={{ margin: "0 0 8px 0", textAlign: "left" }}>
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul
                              style={{
                                margin: "0 0 8px 0",
                                paddingLeft: "20px",
                                textAlign: "left",
                              }}
                            >
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol
                              style={{
                                margin: "0 0 8px 0",
                                paddingLeft: "20px",
                                textAlign: "left",
                              }}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li style={{ textAlign: "left" }}>{children}</li>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    background: "#ffffff",
                    color: "#1f2937",
                    padding: "12px 16px",
                    borderRadius: 16,
                    textAlign: "left",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    aria-label="Assistant is typing"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      height: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#4b5563",
                        animation: "bg-typing-bounce 1.2s infinite ease-in-out",
                      }}
                    />
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#4b5563",
                        animation: "bg-typing-bounce 1.2s infinite ease-in-out",
                        animationDelay: "0.2s",
                      }}
                    />
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#4b5563",
                        animation: "bg-typing-bounce 1.2s infinite ease-in-out",
                        animationDelay: "0.4s",
                      }}
                    />
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 12,
          padding: "16px 20px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
          alignItems: "flex-end",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 24,
            border: "2px solid #e2e8f0",
            outline: "none",
            fontSize: "16px",
            background: "#f8fafc",
            color: "#1f2937",
            transition: "all 0.2s ease",
            resize: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3B82F6";
            e.target.style.background = "#ffffff";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.background = "#f8fafc";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: "12px 16px",
            borderRadius: 24,
            border: "none",
            background:
              isLoading || !input.trim()
                ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
                : "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)",
            color: "white",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            boxShadow:
              isLoading || !input.trim()
                ? "none"
                : "0 4px 12px rgba(59, 130, 246, 0.4)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(59, 130, 246, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59, 130, 246, 0.4)";
            }
          }}
        >
          {isLoading ? (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.5)",
                borderTopColor: "#ffffff",
                borderRadius: "50%",
                animation: "bg-spin 0.8s linear infinite",
              }}
            />
          ) : (
            "➤"
          )}
        </button>
      </form>

      {showUserModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.18), rgba(0,0,0,0.55))",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 8,
          }}
          onClick={() => setShowUserModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: 420,
              borderRadius: 16,
              boxShadow:
                "0 20px 40px rgba(102, 126, 234, 0.25), 0 6px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "14px 18px",
                background: "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 700 }}>Complete your details</div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                aria-label="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "white",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUserModalSubmit}
              style={{ padding: "8px", color: "#0f172a" }}
            >
              <p style={{ margin: 0, marginBottom: 10, color: "#334155" }}>
                Please enter your details so we can personalize your support.
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label
                    htmlFor="bg-user-name"
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "start",
                      marginBottom: 6,
                    }}
                  >
                    Name
                  </label>
                  <input
                    id="bg-user-name"
                    placeholder="John Doe"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (userFieldErrors.name && e.target.value.trim()) {
                        setUserFieldErrors((prev) => ({
                          ...prev,
                          name: false,
                        }));
                      }
                    }}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: userFieldErrors.name
                        ? "1px solid #ef4444"
                        : "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#3B82F6",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #3B82F6";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {userFieldErrors.name && (
                    <div
                      style={{ color: "#b91c1c", fontSize: 11, marginTop: 4 }}
                    >
                      Name is required
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bg-user-email"
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "start",
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="bg-user-email"
                    placeholder="you@company.com"
                    type="email"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      if (userFieldErrors.email && e.target.value.trim()) {
                        setUserFieldErrors((prev) => ({
                          ...prev,
                          email: false,
                        }));
                      }
                    }}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: userFieldErrors.email
                        ? "1px solid #ef4444"
                        : "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#3B82F6",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #3B82F6";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {userFieldErrors.email && (
                    <div
                      style={{ color: "#b91c1c", fontSize: 11, marginTop: 4 }}
                    >
                      Email is required
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bg-user-phone"
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "start",
                      marginBottom: 6,
                    }}
                  >
                    Phone
                  </label>
                  <input
                    id="bg-user-phone"
                    placeholder="+91 98765 XXXXX"
                    value={userPhone}
                    onChange={(e) => {
                      setUserPhone(e.target.value);
                      if (userFieldErrors.phone && e.target.value.trim()) {
                        setUserFieldErrors((prev) => ({
                          ...prev,
                          phone: false,
                        }));
                      }
                    }}
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: userFieldErrors.phone
                        ? "1px solid #ef4444"
                        : "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#3B82F6",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #3B82F6";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {userFieldErrors.phone && (
                    <div
                      style={{ color: "#b91c1c", fontSize: 11, marginTop: 4 }}
                    >
                      Phone is required
                    </div>
                  )}
                </div>
              </div>

              {userError && (
                <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                  {userError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 14,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #A64BF6 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 14px rgba(59, 130, 246, 0.35)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 18px rgba(59, 130, 246, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(59, 130, 246, 0.35)";
                  }}
                >
                  Save details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
