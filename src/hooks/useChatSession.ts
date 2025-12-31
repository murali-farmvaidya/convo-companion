import { useState, useCallback, useEffect } from 'react';
import { ChatUser, ChatMessage, ConversationSession } from '@/types/chat';
import { registerUser, saveMessage, getMessages, resetSession as resetSessionApi } from '@/services/mongoApi';

const STORAGE_KEY = 'chat_session';

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const useChatSession = () => {
  const [session, setSession] = useState<ConversationSession | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          messages: parsed.messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const saveSessionLocally = useCallback((newSession: ConversationSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const startSession = useCallback(async (name: string, email: string) => {
    const sessionId = generateSessionId();
    
    const user: ChatUser = {
      name,
      email,
      sessionId,
    };

    const welcomeMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: `Hello ${name}! 👋 Welcome to Farm Vaidya Support. I'm here to help you with any questions about our agricultural solutions, products, or services. How can I assist you today?`,
      timestamp: new Date(),
    };

    const newSession: ConversationSession = {
      user,
      messages: [welcomeMessage],
      isTyping: false,
    };

    // Save locally first for instant UI
    saveSessionLocally(newSession);

    // Then sync to MongoDB
    try {
      setIsSyncing(true);
      await registerUser({ name, email, sessionId });
      await saveMessage({
        sessionId,
        role: 'assistant',
        content: welcomeMessage.content,
      });
      console.log('Session synced to MongoDB');
    } catch (error) {
      console.error('Failed to sync session to MongoDB:', error);
      // Continue anyway - local storage works as fallback
    } finally {
      setIsSyncing(false);
    }

    return newSession;
  }, [saveSessionLocally]);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
    };

    setSession((prev) => {
      if (!prev) return null;

      const newSession = {
        ...prev,
        messages: [...prev.messages, newMessage],
      };

      saveSessionLocally(newSession);

      // Sync to MongoDB in background
      saveMessage({
        sessionId: prev.user.sessionId,
        role,
        content,
      }).catch((error) => {
        console.error('Failed to save message to MongoDB:', error);
      });

      return newSession;
    });
  }, [saveSessionLocally]);

  const resetSessionHandler = useCallback(async () => {
    const sessionId = session?.user.sessionId;
    
    // Clear locally
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);

    // Sync to MongoDB
    if (sessionId) {
      try {
        await resetSessionApi(sessionId);
        console.log('Session reset in MongoDB');
      } catch (error) {
        console.error('Failed to reset session in MongoDB:', error);
      }
    }
  }, [session]);

  const getConversationHistory = useCallback(() => {
    if (!session) return [];
    return session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [session]);

  return {
    session,
    isTyping,
    isSyncing,
    setIsTyping,
    startSession,
    addMessage,
    resetSession: resetSessionHandler,
    getConversationHistory,
    isAuthenticated: !!session?.user,
  };
};
