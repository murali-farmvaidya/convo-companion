import { useState, useCallback } from 'react';
import { ChatUser, ChatMessage, ConversationSession } from '@/types/chat';

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

  const saveSession = useCallback((newSession: ConversationSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const startSession = useCallback((name: string, email: string) => {
    const user: ChatUser = {
      name,
      email,
      sessionId: generateSessionId(),
    };

    const newSession: ConversationSession = {
      user,
      messages: [
        {
          id: generateMessageId(),
          role: 'assistant',
          content: `Hello ${name}! 👋 Welcome to Farm Vaidya Support. I'm here to help you with any questions about our agricultural solutions, products, or services. How can I assist you today?`,
          timestamp: new Date(),
        },
      ],
      isTyping: false,
    };

    saveSession(newSession);
    return newSession;
  }, [saveSession]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setSession((prev) => {
      if (!prev) return null;

      const newMessage: ChatMessage = {
        id: generateMessageId(),
        role,
        content,
        timestamp: new Date(),
      };

      const newSession = {
        ...prev,
        messages: [...prev.messages, newMessage],
      };

      saveSession(newSession);
      return newSession;
    });
  }, [saveSession]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

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
    setIsTyping,
    startSession,
    addMessage,
    resetSession,
    getConversationHistory,
    isAuthenticated: !!session?.user,
  };
};
