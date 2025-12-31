const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1 bg-chat-bot-bubble rounded-2xl rounded-bl-md px-4 py-3">
        <span 
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing"
          style={{ animationDelay: '200ms' }}
        />
        <span 
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
