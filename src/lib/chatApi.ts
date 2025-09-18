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

function getStoredSessionId(): string | undefined {
  try {
    return localStorage.getItem(SESSION_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function setStoredSessionId(id: string) {
  try {
    localStorage.setItem(SESSION_KEY, id);
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
      session_id: existingSessionId,
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
