export type ChatRequestBody = {
  question: string;
};

export type ChatRawResponse = {
  response: string;
  session_id?: string;
  relevant_pages?: string[];
};

export type ChatSuccessResponse = {
  answer: string;
  sessionId?: string;
  relevantPages?: string[];
};

export async function sendChatQuestion(
  question: string
): Promise<ChatSuccessResponse> {
  const url = import.meta.env.VITE_CHAT_API_URL;
  // const apiKey = import.meta.env.VITE_CHAT_API_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "x-api-key": apiKey,
    },
    body: JSON.stringify({ question } satisfies ChatRequestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} ${errorText}`
    );
  }

  const data = (await response.json()) as ChatRawResponse;
  console.log(data);

  return {
    answer: data.response,
    sessionId: data.session_id,
    relevantPages: data.relevant_pages,
  } satisfies ChatSuccessResponse;
}
