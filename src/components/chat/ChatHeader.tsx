import { Button } from '@/components/ui/button';
import { X, RotateCcw, Leaf } from 'lucide-react';

interface ChatHeaderProps {
  userName?: string;
  onClose: () => void;
  onReset: () => void;
}

const ChatHeader = ({ userName, onClose, onReset }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Farm Vaidya Support</h3>
          {userName && (
            <p className="text-xs text-muted-foreground">Chatting with {userName}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
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
