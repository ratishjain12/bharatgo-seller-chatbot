import { getUserInfo } from "../helpers";
import {
  getStoredSessionId,
  setStoredSessionId,
  setStoredUserInfo,
  touchStoredSession,
  clearStoredSession,
  getStoredObj,
  setStoredChatHistory,
} from "../helpers/session";
import type {
  ChatRawResponse,
  ChatRequestBody,
  ChatSuccessResponse,
} from "../types";

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
    if (existingSessionId) {
      setStoredChatHistory([]);
    }
  } else if (existingSessionId) {
    touchStoredSession();
  }

  const prev = getStoredObj()?.userInfo;
  if (user_info && JSON.stringify(prev) !== JSON.stringify(user_info)) {
    setStoredUserInfo(user_info);
    // setStoredUserInfo already handles vendor ID update with email
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
