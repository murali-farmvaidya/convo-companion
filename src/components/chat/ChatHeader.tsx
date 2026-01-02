import { Button } from '@/components/ui/button';
import { X, RotateCcw, ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  userName?: string;
  onClose: () => void;
  onReset: () => void;
  onBack?: () => void;
}

const ChatHeader = ({ userName, onClose, onReset, onBack }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-yellow-300" style={{backgroundColor: '#ffdd00'}}>
      <div className="flex items-center gap-3">
        <img 
          src="/yellow.png" 
          alt="Chat Logo"
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-bold text-foreground text-sm">Customer Support</h3>
          {userName && (
            <p className="text-xs text-foreground/70">Chatting with {userName}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {onBack && (
          <Button
            variant="chatGhost"
            size="iconSm"
            onClick={onBack}
            title="Back to history"
            className="hover:bg-amber-200/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {userName && (
          <Button
            variant="chatGhost"
            size="iconSm"
            onClick={onReset}
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="chatGhost"
          size="iconSm"
          onClick={onClose}
          title="Close chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
