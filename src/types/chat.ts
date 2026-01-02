export interface ChatUser {
  name: string;
  email: string;
  sessionId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationSession {
  user: ChatUser;
  messages: ChatMessage[];
  isTyping: boolean;
}

export interface ConversationSummary {
  sessionId: string;
  name?: string;
  createdAt: string;
  messageCount: number;
}

export interface LightRAGRequest {
  query: string;
  mode: 'local' | 'global' | 'hybrid' | 'naive' | 'mix' | 'bypass';
  include_references?: boolean;
  response_type?: string;
  conversation_history?: Array<{ role: string; content: string }>;
  top_k?: number;
  max_total_tokens?: number;
}

export interface LightRAGResponse {
  response: string;
  references?: Array<{
    reference_id: string;
    file_path: string;
  }> | null;
}
