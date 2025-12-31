import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const parseMarkdown = (text: string) => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  // Regex patterns for markdown
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, tag: 'strong' }, // Bold
    { regex: /\*(.*?)\*/g, tag: 'em' }, // Italic
    { regex: /`(.*?)`/g, tag: 'code' }, // Inline code
  ];

  // Process text with patterns
  let tempText = text;
  let offset = 0;

  // First, handle bold
  tempText = tempText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Then italic (but not the bold we just created)
  tempText = tempText.replace(/(?<!\*)\*(.*?)\*(?!\*)/g, '<em>$1</em>');
  
  // Inline code
  tempText = tempText.replace(/`(.*?)`/g, '<code>$1</code>');

  // Handle line breaks and lists
  const lines = tempText.split('\n');
  const result: JSX.Element[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      // List item
      const content = line.trim().substring(2);
      result.push(
        <li key={`${idx}-li`} className="ml-4 text-sm">
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </li>
      );
    } else if (line.trim().startsWith('1. ') || /^\d+\. /.test(line.trim())) {
      // Ordered list
      const match = line.match(/^(\s*)\d+\.\s+(.*)/);
      if (match) {
        result.push(
          <li key={`${idx}-ol`} className="ml-4 text-sm list-decimal list-inside">
            <span dangerouslySetInnerHTML={{ __html: match[2] }} />
          </li>
        );
      }
    } else if (line.trim()) {
      result.push(
        <p key={`${idx}-p`} className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </p>
      );
    } else {
      result.push(<div key={`${idx}-br`} className="h-1" />);
    }
  });

  return result.length > 0 ? result : [<p key="empty">{text}</p>];
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const parsedContent = parseMarkdown(message.content);

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-2 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-chat-user-bubble text-primary-foreground rounded-br-md'
            : 'bg-chat-bot-bubble text-chat-bot-foreground rounded-bl-md'
        )}
      >
        <div className="space-y-1">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert [&_strong]:font-bold [&_em]:italic [&_code]:bg-black/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
              {parsedContent}
            </div>
          )}
        </div>
        <span
          className={cn(
            'text-[10px] mt-1 block opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
