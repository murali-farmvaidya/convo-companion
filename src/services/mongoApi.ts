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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Debug log API base URL in development
if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
}

const callMongoApi = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
): Promise<T> => {
  // Remove leading slash if present in endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  let url = `${API_BASE_URL}/${cleanEndpoint}`;
  
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

  try {
    const response = await fetch(url, options);
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Non-JSON response from ${url}:`, text.substring(0, 200));
      throw new Error(`Expected JSON but got ${contentType || 'unknown'} from ${endpoint}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
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

export const getUserSessions = async (
  contact: string
): Promise<{
  success: boolean;
  user?: { name?: string; email?: string } | null;
  sessions: Array<{ sessionId: string; name?: string; createdAt: string; messageCount: number }>;
}> => {
  // Backend expects `email` query param; we pass contact (email or phone) in the same field.
  return callMongoApi('sessions', 'GET', undefined, { email: contact });
};

export const deleteUserSession = async (sessionId: string): Promise<{ success: boolean }> => {
  return callMongoApi(`sessions/${sessionId}`, 'DELETE');
};
