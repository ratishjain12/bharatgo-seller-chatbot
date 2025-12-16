export const SESSION_KEY = "bharatgo-seller-session-id";
export const TTL_MS = 15 * 60 * 1000; // 15 minutes
const PENDING_HISTORY_KEY = "bharatgo-seller-history:pending";
const VENDOR_ID_KEY = "bharatgo-seller-vendor-id";

export type StoredSession = {
  id: string;
  exp: number | null;
  vendorId?: string; // Store vendor identifier to detect vendor changes
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

function getVendorId(): string | null {
  try {
    // Try to get vendor email from stored session first (most reliable)
    const stored = getStoredObj();
    if (stored?.userInfo?.email) {
      return stored.userInfo.email;
    }

    // Fallback: use token hash if no email available yet
    // This handles the case before first API call
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Use a simple hash of the token as temporary vendor identifier
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return "vendor_" + Math.abs(hash).toString(36);
  } catch {
    return null;
  }
}

export function checkAndClearIfVendorChanged(): boolean {
  try {
    const currentVendorId = getVendorId();
    const storedVendorId = localStorage.getItem(VENDOR_ID_KEY);

    // If no current vendor but there's stored data, clear it
    if (!currentVendorId && storedVendorId) {
      clearStoredSession();
      clearPendingHistory();
      localStorage.removeItem(VENDOR_ID_KEY);
      return true;
    }

    // If vendor changed, clear all session data
    if (
      currentVendorId &&
      storedVendorId &&
      currentVendorId !== storedVendorId
    ) {
      clearStoredSession();
      clearPendingHistory();
      localStorage.setItem(VENDOR_ID_KEY, currentVendorId);
      return true;
    }

    // If new vendor login, store the vendor ID
    if (currentVendorId && !storedVendorId) {
      localStorage.setItem(VENDOR_ID_KEY, currentVendorId);
    }

    return false;
  } catch {
    return false;
  }
}

export function getStoredObj(): StoredSession | undefined {
  try {
    // Check if vendor changed first
    checkAndClearIfVendorChanged();

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredSession | string;
    if (typeof parsed === "string") return { id: parsed, exp: null };
    if (parsed.exp && parsed.exp <= now()) {
      localStorage.removeItem(SESSION_KEY);
      return undefined;
    }

    // Verify vendor ID matches
    const currentVendorId = getVendorId();
    if (
      currentVendorId &&
      parsed.vendorId &&
      parsed.vendorId !== currentVendorId
    ) {
      clearStoredSession();
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
    const vendorId = getVendorId();
    const next: StoredSession = {
      id,
      exp,
      vendorId: vendorId || undefined,
      userInfo: opts?.resetUserInfo ? undefined : prev?.userInfo,
      chatHistory: pending.length > 0 ? pending : prev?.chatHistory,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    if (pending.length > 0) clearPendingHistory();

    // Update vendor ID
    if (vendorId) {
      localStorage.setItem(VENDOR_ID_KEY, vendorId);
    }
  } catch {
    // ignore
  }
}

export function setStoredUserInfo(userInfo: StoredSession["userInfo"]) {
  try {
    const prev = getStoredObj();
    if (!prev?.id) return;

    // Update vendor ID to email when user info is set (email is stable identifier)
    const vendorId = userInfo?.email || prev.vendorId;
    if (userInfo?.email) {
      const currentVendorId = localStorage.getItem(VENDOR_ID_KEY);
      // If email changed, it's a different vendor - clear session
      if (currentVendorId && currentVendorId !== userInfo.email) {
        clearStoredSession();
        clearPendingHistory();
      }
      localStorage.setItem(VENDOR_ID_KEY, userInfo.email);
    }

    const next: StoredSession = { ...prev, userInfo, vendorId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    clearPendingHistory();
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
