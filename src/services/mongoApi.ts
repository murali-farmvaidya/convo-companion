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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const callMongoApi = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
): Promise<T> => {
  let url = `${API_BASE_URL}/${endpoint}`;
  
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url += `?${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
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
  return callMongoApi('users/register', 'POST', payload as unknown as Record<string, unknown>);
};

export const saveMessage = async (payload: SaveMessagePayload): Promise<{ success: boolean }> => {
  return callMongoApi('messages/save', 'POST', payload as unknown as Record<string, unknown>);
};

export const getMessages = async (sessionId: string): Promise<{ success: boolean; messages: Array<{ role: string; content: string; timestamp: string }> }> => {
  return callMongoApi('messages', 'GET', undefined, { sessionId });
};

export const resetSession = async (sessionId: string): Promise<{ success: boolean }> => {
  return callMongoApi('sessions/reset', 'POST', { sessionId });
};

export const getUserSessions = async (email: string): Promise<{ success: boolean; user?: unknown; sessions: unknown[] }> => {
  return callMongoApi('sessions', 'GET', undefined, { email });
};
