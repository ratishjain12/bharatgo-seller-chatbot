export const SESSION_KEY = "chat-session-id";
export const TTL_MS = 15 * 60 * 1000; // 15 minutes
const PENDING_HISTORY_KEY = "chat:history:pending";

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

function getPendingHistory(): NonNullable<StoredSession["chatHistory"]> {
  try {
    const raw = localStorage.getItem(PENDING_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as StoredSession["chatHistory"]) ?? [] : [];
  } catch {
    return [];
  }
}

function setPendingHistory(history: StoredSession["chatHistory"]) {
  try {
    localStorage.setItem(PENDING_HISTORY_KEY, JSON.stringify(history ?? []));
  } catch {
    // ignore
  }
}

function clearPendingHistory() {
  try {
    localStorage.removeItem(PENDING_HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function setStoredSessionId(
  id: string,
  opts?: { resetUserInfo?: boolean }
) {
  try {
    const exp = now() + TTL_MS;
    const prev = getStoredObj();
    const pending = getPendingHistory();
    const next: StoredSession = {
      id,
      exp,
      userInfo: opts?.resetUserInfo ? undefined : prev?.userInfo,
      chatHistory: pending.length > 0 ? pending : prev?.chatHistory,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    if (pending.length > 0) clearPendingHistory();
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
  const obj = getStoredObj();
  if (obj?.id) return obj.chatHistory ?? [];
  return getPendingHistory();
}

export function setStoredChatHistory(history: StoredSession["chatHistory"]) {
  try {
    const prev = getStoredObj();
    if (!prev?.id) {
      setPendingHistory(history ?? []);
      return;
    }
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
    if (!prev?.id) {
      // Buffer in pending until a session exists
      const pending = getPendingHistory();
      setPendingHistory([...pending, message].slice(-50));
      return;
    }
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
