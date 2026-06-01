export interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
}

export type ChatbotIntent =
  | 'answer'
  | 'unsupported'
  | 'lead_capture'
  | 'roadmap'
  | 'refusal'
  | 'comparison_redirect'
  | 'human_escalation';

export interface ChatbotResponse {
  reply: string;
  intent: ChatbotIntent;
  citations: Citation[];
  escalate?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  citations?: Citation[];
  intent?: ChatbotIntent;
}

export interface ChatSession {
  id: string;
  pagePath: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface LeadCaptureInput {
  sessionId?: string | undefined;
  email: string;
  company: string;
  role: string;
  need: string;
  pagePath?: string | undefined;
}

export interface LeadCaptureResult {
  ok: true;
  leadId: string;
}
