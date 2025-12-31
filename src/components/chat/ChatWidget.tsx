import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
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

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    session,
    isTyping,
    setIsTyping,
    startSession,
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

  const handleRegistration = (name: string, email: string) => {
    startSession(name, email);
    toast({
      title: "Welcome!",
      description: `Great to have you, ${name}! Ask me anything about agricultural solutions.`,
    });
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
        "I apologize, but I'm having trouble connecting to our knowledge base right now. Please try again in a moment, or contact our support team directly."
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
    toast({
      title: "Chat Reset",
      description: "Your conversation has been cleared.",
    });
  };

  return (
    <>
      {/* Chat Bubble */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300',
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-bounce-in shadow-glow'
        )}
        variant="chat"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-card transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {isAuthenticated ? (
          <div className="flex flex-col h-full">
            <ChatHeader
              userName={session?.user.name}
              onClose={() => setIsOpen(false)}
              onReset={handleReset}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto chat-scrollbar bg-background/50">
              {session?.messages.map((message) => (
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
            <RegistrationForm onSubmit={handleRegistration} />
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
