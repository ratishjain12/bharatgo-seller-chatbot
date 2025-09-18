export type ChatRequestBody = {
  question: string;
  session_id?: string;
};

export type ChatRawResponse = {
  response: string;
  session_id?: string;
  relevant_pages?: string[];

  requires_user_info?: boolean;
  missing_fields?: Array<"name" | "email" | "phone">;
  user_info?: {
    name?: string;
    email?: string;
    phone?: string;
    [k: string]: unknown;
  };

  source_type?: string;
  source_document?: string;
  has_contact_form?: boolean;
};

export type ChatSuccessResponse = {
  answer: string;
  sessionId?: string;
  relevantPages?: string[];
  requiresUserInfo?: boolean;
  missingFields?: Array<"name" | "email" | "phone">;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    [k: string]: unknown;
  };

  // metadata
  sourceType?: string;
  sourceDocument?: string;
  hasContactForm?: boolean;
};

const SESSION_KEY = "chat-session-id";
const TTL_MS = 15 * 60 * 1000; // 15 minutes

type StoredSession = { id: string; exp: number | null };

function now() {
  return Date.now();
}

function getStoredSessionId(): string | undefined {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredSession | string;
    if (typeof parsed === "string") return parsed; // backwards compat
    if (parsed.exp && parsed.exp <= now()) {
      localStorage.removeItem(SESSION_KEY);
      return undefined;
    }
    return parsed.id;
  } catch {
    return undefined;
  }
}

function setStoredSessionId(id: string) {
  try {
    const exp = now() + TTL_MS;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id, exp } as StoredSession)
    );
  } catch {
    // ignore
  }
}

export async function sendChatQuestion(
  question: string
): Promise<ChatSuccessResponse> {
  const url = import.meta.env.VITE_CHAT_API_URL;

  const existingSessionId = getStoredSessionId();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      ...(existingSessionId
        ? ({ session_id: existingSessionId } as const)
        : {}),
    } satisfies ChatRequestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} ${errorText}`
    );
  }

  const data = (await response.json()) as ChatRawResponse;

  if (data.session_id && data.session_id !== existingSessionId) {
    setStoredSessionId(data.session_id);
  }

  return {
    answer: data.response,
    sessionId: data.session_id ?? existingSessionId,
    relevantPages: data.relevant_pages,
    requiresUserInfo: data.requires_user_info,
    missingFields: data.missing_fields,
    userInfo: data.user_info,
    sourceType: data.source_type,
    sourceDocument: data.source_document,
    hasContactForm: data.has_contact_form,
  } satisfies ChatSuccessResponse;
}
