import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { sendChatQuestion } from "../lib/chatApi";
import { setStoredUserInfo } from "../helpers/session";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Chatbot({ embedded = false }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userError, setUserError] = useState<string | null>(null);

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
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendChatQuestion(trimmed);
      if (res.requiresUserInfo) {
        setShowUserModal(true);
      }
      const normalizeMarkdown = (text: string) =>
        text
          // Replace bullet • or \u2022 at start of lines with markdown dashes
          .replace(/^[\t ]*[•\u2022][\t ]?/gm, "- ")
          .replace(/\r\n/g, "\n");
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer
          ? normalizeMarkdown(res.answer)
          : "No answer returned.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      // scroll to bottom
      queueMicrotask(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  const handleUserModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    const name = userName.trim();
    const email = userEmail.trim();
    const phone = userPhone.trim();
    if (!name || !email || !phone) {
      setUserError("Please fill all fields.");
      return;
    }
    try {
      setStoredUserInfo({ name, email, phone });
      setShowUserModal(false);
    } catch {
      setUserError("Could not save details. Try again.");
    }
  };

  const placeholder = useMemo(
    () => (isLoading ? "Waiting for response..." : "Ask something..."),
    [isLoading]
  );

  return (
    <div
      style={{
        height: embedded ? "100%" : 540,
        width: embedded ? "100%" : "100%",
        maxWidth: embedded ? undefined : 720,
        margin: embedded ? 0 : "24px auto",
        border: embedded ? "none" : "1px solid #e5e7eb",
        borderRadius: embedded ? 0 : 12,
        boxShadow: embedded ? "none" : "0 12px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
          messages.map((m) => (
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
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : m.role === "assistant"
                      ? "#ffffff"
                      : "#fef3c7",
                  color: m.role === "user" ? "white" : "#1f2937",
                  padding: "12px 16px",
                  borderRadius: 16,
                  boxShadow:
                    m.role === "assistant"
                      ? "0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)"
                      : "0 2px 8px rgba(102, 126, 234, 0.3)",
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
          ))
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
            fontSize: "14px",
            background: "#f8fafc",
            color: "#1f2937",
            transition: "all 0.2s ease",
            resize: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.background = "#ffffff";
            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
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
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            boxShadow:
              isLoading || !input.trim()
                ? "none"
                : "0 4px 12px rgba(102, 126, 234, 0.4)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(102, 126, 234, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(102, 126, 234, 0.4)";
            }
          }}
        >
          {isLoading ? "⏳" : "➤"}
        </button>
      </form>

      {showUserModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(102,126,234,0.18), rgba(0,0,0,0.55))",
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#667eea",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #667eea";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(102, 126, 234, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
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
                    onChange={(e) => setUserEmail(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#667eea",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #667eea";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(102, 126, 234, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
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
                    placeholder="+91 98765 43210"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 8px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      caretColor: "#667eea",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid #667eea";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(102, 126, 234, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
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
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 14px rgba(102, 126, 234, 0.35)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 18px rgba(102, 126, 234, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(102, 126, 234, 0.35)";
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
