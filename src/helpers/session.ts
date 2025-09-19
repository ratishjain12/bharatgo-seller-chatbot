export const SESSION_KEY = "chat-session-id";
export const TTL_MS = 15 * 60 * 1000; // 15 minutes

export type StoredSession = {
  id: string;
  exp: number | null;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    [k: string]: unknown;
  };
  chatHistory?: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
  }>;
};

function now() {
  return Date.now();
}

export function getStoredObj(): StoredSession | undefined {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredSession | string;
    if (typeof parsed === "string") return { id: parsed, exp: null };
    if (parsed.exp && parsed.exp <= now()) {
      localStorage.removeItem(SESSION_KEY);
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function getStoredSessionId(): string | undefined {
  return getStoredObj()?.id;
}

export function setStoredSessionId(
  id: string,
  opts?: { resetUserInfo?: boolean }
) {
  try {
    const exp = now() + TTL_MS;
    const prev = getStoredObj();
    const next: StoredSession = {
      id,
      exp,
      userInfo: opts?.resetUserInfo ? undefined : prev?.userInfo,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function setStoredUserInfo(userInfo: StoredSession["userInfo"]) {
  try {
    const prev = getStoredObj();
    if (!prev?.id) return;
    const next: StoredSession = { ...prev, userInfo };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function touchStoredSession() {
  try {
    const prev = getStoredObj();
    if (!prev?.id) return;
    const next: StoredSession = { ...prev, exp: now() + TTL_MS };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getStoredChatHistory(): StoredSession["chatHistory"] {
  return getStoredObj()?.chatHistory ?? [];
}

export function setStoredChatHistory(history: StoredSession["chatHistory"]) {
  try {
    const prev = getStoredObj();
    if (!prev?.id) return;
    const next: StoredSession = { ...prev, chatHistory: history };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function addStoredChatMessage(message: {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}) {
  try {
    const prev = getStoredObj();
    if (!prev?.id) return;
    const history = prev.chatHistory ?? [];
    const next: StoredSession = {
      ...prev,
      chatHistory: [...history, message].slice(-50), // Keep last 50 messages
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
