export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

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

  sourceType?: string;
  sourceDocument?: string;
  hasContactForm?: boolean;
};
