import { getUserInfo } from "../helpers";
import {
  getStoredSessionId,
  setStoredSessionId,
  setStoredUserInfo,
  touchStoredSession,
  clearStoredSession,
  getStoredObj,
} from "../helpers/session";

export type ChatRequestBody = {
  question: string;
  session_id?: string;
  user_info?: {
    name?: string;
    email?: string;
    phone?: string;
    [k: string]: unknown;
  };
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

export async function sendChatQuestion(
  question: string
): Promise<ChatSuccessResponse> {
  const url = import.meta.env.VITE_CHAT_API_URL;

  let user_info: ChatRequestBody["user_info"] | null = null;
  try {
    const token = localStorage.getItem("token");
    if (token) {
      user_info = await getUserInfo();
    } else {
      user_info = getStoredObj()?.userInfo ?? null;
    }
  } catch {
    user_info = getStoredObj()?.userInfo ?? null;
  }

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
      ...(user_info ? ({ user_info: user_info } as const) : {}),
    } satisfies ChatRequestBody),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 440) {
      clearStoredSession();
    }
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} ${errorText}`
    );
  }

  const data = (await response.json()) as ChatRawResponse;

  if (data.session_id && data.session_id !== existingSessionId) {
    setStoredSessionId(data.session_id, { resetUserInfo: true });
  } else if (existingSessionId) {
    touchStoredSession();
  }

  const prev = getStoredObj()?.userInfo;
  if (user_info && JSON.stringify(prev) !== JSON.stringify(user_info)) {
    setStoredUserInfo(user_info);
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
