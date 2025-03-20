
import React from 'react';
import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/utils/api';

interface MessageProps {
  message: MessageType;
  isLast: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "py-3 px-4 rounded-2xl w-full max-w-[85%] message-in",
        isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : "mr-auto bg-secondary text-secondary-foreground"
      )}
    >
      <div className="text-sm sm:text-base leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className="py-3 px-6 rounded-2xl bg-secondary text-secondary-foreground w-24 mr-auto">
      <div className="typing-indicator flex space-x-1 items-center justify-center">
        <span className="w-2 h-2 bg-muted-foreground/70 rounded-full"></span>
        <span className="w-2 h-2 bg-muted-foreground/70 rounded-full"></span>
        <span className="w-2 h-2 bg-muted-foreground/70 rounded-full"></span>
      </div>
    </div>
  );
};

export default Message;
