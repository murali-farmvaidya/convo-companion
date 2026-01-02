import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatSession } from '@/hooks/useChatSession';
import { queryLightRAG } from '@/services/lightragApi';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import RegistrationForm from './RegistrationForm';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useState as useReactState } from 'react';

interface ChatWidgetProps {
  apiBaseUrl?: string;
  floating?: boolean;
  theme?: string;
  title?: string;
}

const ChatWidget = ({ 
  apiBaseUrl = 'http://localhost:3000/api',
  floating = true,
  theme = 'light',
  title = 'Chat Support'
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useReactState<'auth' | 'history' | 'chat'>('auth');
  const [availableSessions, setAvailableSessions] = useReactState<
    Array<{ sessionId: string; name?: string; createdAt: string; messageCount: number }>
  >([]);
  const [pendingUser, setPendingUser] = useReactState<{ name: string; contact: string } | null>(null);
  const [authStep, setAuthStep] = useReactState<'form' | 'history'>('form');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    session,
    isTyping,
    isSyncing,
    setIsTyping,
    startSession,
    fetchUserSessions,
    continueExistingSession,
    deleteSession,
    addMessage,
    resetSession,
    getConversationHistory,
    isAuthenticated,
  } = useChatSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isTyping]);

  const handleSubmitDetails = async (name: string, contact: string) => {
    setPendingUser({ name, contact });
    try {
      const sessionsRes = await fetchUserSessions(contact);
      const sessions = sessionsRes?.sessions || [];
      setAvailableSessions(sessions);
      setAuthStep('history');
      setViewMode('history');
      if (!sessions.length) {
        toast({
          title: "No history found",
          description: "You can start a new conversation.",
        });
      }
    } catch (error) {
      console.error(error);
      setAvailableSessions([]);
      setAuthStep('history');
      setViewMode('history');
      toast({
        title: "Unable to load conversations",
        description: "You can still start a new conversation.",
        variant: "destructive",
      });
    }
  };

  const handleStartNew = async () => {
    if (!pendingUser) {
      toast({
        title: "Enter your details",
        description: "Please provide your name and contact first.",
        variant: "destructive",
      });
      setAuthStep('form');
      setViewMode('auth');
      return;
    }
    const { name, contact } = pendingUser;
    await startSession(name, contact);
    setViewMode('chat');
    toast({
      title: "Welcome!",
      description: `Great to have you, ${name}!`,
    });
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!pendingUser) return;
    try {
      await continueExistingSession(pendingUser.contact, sessionId, pendingUser.name);
      setViewMode('chat');
      setIsOpen(true);
      toast({
        title: "Welcome back!",
        description: "Loaded your previous conversation.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to open conversation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!pendingUser) return;
    try {
      await deleteSession(sessionId);
      const refreshed = await fetchUserSessions(pendingUser.contact);
      setAvailableSessions(refreshed?.sessions || []);
      toast({
        title: "Conversation deleted",
        description: "This chat history was removed.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to delete",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToHistory = async () => {
    if (pendingUser) {
      try {
        const refreshed = await fetchUserSessions(pendingUser.contact);
        setAvailableSessions(refreshed?.sessions || []);
      } catch (error) {
        console.error('Failed to refresh history:', error);
      }
    }
    setViewMode('history');
  };

  const handleSendMessage = async (content: string) => {
    if (!session) return;

    addMessage('user', content);
    setIsTyping(true);

    try {
      const history = getConversationHistory();
      const response = await queryLightRAG(content, history);
      addMessage('assistant', response);
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(
        'assistant',
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      );
      toast({
        title: "Connection Error",
        description: "Unable to reach the server. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    resetSession();
    setPendingUser(null);
    setAvailableSessions([]);
    setAuthStep('form');
    setViewMode('auth');
    toast({
      title: "Chat Reset",
      description: "Your conversation has been cleared.",
    });
  };

  // Inline (non-floating) mode - fullscreen
  if (!floating) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-300">
        {viewMode === 'chat' && session ? (
          <>
            <ChatHeader 
              userName={session.user.name} 
              onClose={() => {}} 
              onReset={handleReset}
              onBack={handleBackToHistory}
            />
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-green-50 to-yellow-50">
              {session.messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSendMessage} disabled={isTyping || isSyncing} />
          </>
        ) : (
          <RegistrationForm
            step={authStep}
            onSubmitDetails={handleSubmitDetails}
            onStartNew={handleStartNew}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            availableSessions={availableSessions}
            isSyncing={isSyncing}
            pendingUser={pendingUser}
            onBack={() => (viewMode === 'history' ? setAuthStep('form') : null)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Chat Bubble */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 border-2 border-yellow-400 rounded-full shadow-lg shadow-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/60',
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-bounce-in'
        )}
        variant="ghost"
        size="icon"
      >
        <div className="relative w-full h-full animate-bubble-roll overflow-hidden rounded-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/yellow.png"
              alt="Farm Vaidya"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-3rem)] rounded-3xl overflow-hidden shadow-2xl shadow-yellow-500/20 border-4 border-yellow-300 bg-white/95 backdrop-blur-sm transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-4',
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {viewMode === 'chat' && session ? (
          <div className="flex flex-col h-full">
            <ChatHeader
              userName={session.user.name}
              onClose={() => setIsOpen(false)}
              onReset={handleReset}
              onBack={handleBackToHistory}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-green-50 to-yellow-50">
              {session.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-end p-2">
              <Button
                variant="chatGhost"
                size="iconSm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <RegistrationForm
              step={authStep}
              onSubmitDetails={handleSubmitDetails}
              onStartNew={handleStartNew}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              availableSessions={availableSessions}
              isSyncing={isSyncing}
              pendingUser={pendingUser}
              onBack={() => (viewMode === 'history' ? setAuthStep('form') : null)}
            />
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatWidget;
