import { supabase } from '@/integrations/supabase/client';

interface RegisterUserPayload {
  name: string;
  email: string;
  sessionId: string;
}

interface SaveMessagePayload {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-db`;

const callEdgeFunction = async <T>(
  action: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
): Promise<T> => {
  let url = `${EDGE_FUNCTION_URL}?action=${action}`;
  
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };

  if (method === 'POST' && body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const registerUser = async (payload: RegisterUserPayload): Promise<{ success: boolean; isReturning?: boolean }> => {
  return callEdgeFunction('register_user', 'POST', payload as unknown as Record<string, unknown>);
};

export const saveMessage = async (payload: SaveMessagePayload): Promise<{ success: boolean }> => {
  return callEdgeFunction('save_message', 'POST', payload as unknown as Record<string, unknown>);
};

export const getMessages = async (sessionId: string): Promise<{ success: boolean; messages: Array<{ role: string; content: string; timestamp: string }> }> => {
  return callEdgeFunction('get_messages', 'GET', undefined, { sessionId });
};

export const resetSession = async (sessionId: string): Promise<{ success: boolean }> => {
  return callEdgeFunction('reset_session', 'POST', { sessionId });
};

export const getUserSessions = async (email: string): Promise<{ success: boolean; user?: unknown; sessions: unknown[] }> => {
  return callEdgeFunction('get_user_sessions', 'GET', undefined, { email });
};
