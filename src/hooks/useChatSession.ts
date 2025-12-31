import { useState, useCallback, useEffect } from 'react';
import { ChatUser, ChatMessage, ConversationSession } from '@/types/chat';
import { registerUser, saveMessage, getMessages, getUserSessions, deleteUserSession, resetSession as resetSessionApi } from '@/services/mongoApi';

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

  useEffect(() => {
    const sessionId = session?.user.sessionId;
    if (!sessionId) return;

    let isActive = true;

    const syncHistory = async () => {
      try {
        setIsSyncing(true);
        const response = await getMessages(sessionId);
        const remoteMessages = response?.messages || [];

        if (!remoteMessages.length || !session) return;

        const mappedMessages: ChatMessage[] = remoteMessages.map((message, idx) => ({
          id: `srv_${sessionId}_${idx}`,
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
          timestamp: new Date(message.timestamp),
        }));

        if (mappedMessages.length > session.messages.length) {
          const syncedSession: ConversationSession = {
            ...session,
            messages: mappedMessages,
          };
          if (isActive) {
            saveSessionLocally(syncedSession);
          }
        }
      } catch (error) {
        console.error('Failed to load history from MongoDB:', error);
      } finally {
        if (isActive) setIsSyncing(false);
      }
    };

    syncHistory();

    return () => {
      isActive = false;
    };
  }, [session, saveSessionLocally]);

  const startSession = useCallback(async (name: string, contact: string) => {
    const sessionId = generateSessionId();
    
    const user: ChatUser = {
      name,
      email: contact,
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
      await registerUser({ name, email: contact, sessionId });
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

  const continueExistingSession = useCallback(
    async (contact: string, sessionId?: string, fallbackName?: string) => {
      setIsSyncing(true);
      try {
        const targetSessionId = sessionId || undefined;
        const sessionsResponse = await getUserSessions(contact);
        const sessions = sessionsResponse.sessions || [];
        const existingUser = sessionsResponse.user;

        if (!sessions.length) {
          throw new Error('No previous conversations found for this contact.');
        }

        const chosenSession = targetSessionId
          ? sessions.find((s) => s.sessionId === targetSessionId)
          : sessions[0];

        if (!chosenSession) {
          throw new Error('Selected conversation not found.');
        }

        const messagesResponse = await getMessages(chosenSession.sessionId);
        const remoteMessages = messagesResponse.messages || [];

        const mappedMessages: ChatMessage[] = remoteMessages.map((message, idx) => ({
          id: `srv_${chosenSession.sessionId}_${idx}`,
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
          timestamp: new Date(message.timestamp),
        }));

        const hydratedSession: ConversationSession = {
          user: {
            name: existingUser?.name || fallbackName || 'Guest',
            email: contact,
            sessionId: chosenSession.sessionId,
          },
          messages: mappedMessages,
          isTyping: false,
        };

        saveSessionLocally(hydratedSession);
        return hydratedSession;
      } finally {
        setIsSyncing(false);
      }
    },
    [saveSessionLocally]
  );

  const fetchUserSessions = useCallback(async (contact: string) => {
    setIsSyncing(true);
    try {
      return await getUserSessions(contact);
    } finally {
      setIsSyncing(false);
    }
  }, []);

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

  const deleteSessionHandler = useCallback(async (sessionId: string) => {
    await deleteUserSession(sessionId);
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
    isSyncing,
    setIsTyping,
    startSession,
    addMessage,
    resetSession: resetSessionHandler,
    getConversationHistory,
    fetchUserSessions,
    continueExistingSession,
    deleteSession: deleteSessionHandler,
    isAuthenticated: !!session?.user,
  };
};
