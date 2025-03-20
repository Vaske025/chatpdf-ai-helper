
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import Message, { TypingIndicator } from './Message';
import { Message as MessageType, sendChatMessage, sendChatMessageWithPdf } from '@/utils/api';
import { PdfInfo } from '@/utils/pdf';
import { cn } from '@/lib/utils';

interface ChatProps {
  apiKey: string;
  activePdf: PdfInfo | null;
}

const Chat: React.FC<ChatProps> = ({ apiKey, activePdf }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    if (!apiKey) {
      alert('Please enter your API key');
      return;
    }
    
    const userMessage: MessageType = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response;
      
      if (activePdf && activePdf.text) {
        // Send message with PDF context
        response = await sendChatMessageWithPdf(
          [...messages, userMessage],
          activePdf.text,
          apiKey
        );
      } else {
        // Send regular chat message
        response = await sendChatMessage(
          [...messages, userMessage],
          apiKey
        );
      }
      
      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full bg-primary animate-pulse-subtle" />
      </div>
      <h3 className="text-xl font-medium mb-2">Ask me anything</h3>
      <p className="text-muted-foreground max-w-md">
        {activePdf && activePdf.text 
          ? `I'll answer questions based on the PDF "${activePdf.name}"`
          : "Upload a PDF or just start chatting for general assistance"}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div 
        className={cn(
          "flex-1 flex flex-col space-y-4 overflow-y-auto p-4",
          messages.length === 0 ? "justify-center" : "justify-start"
        )}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message, index) => (
            <Message 
              key={index} 
              message={message} 
              isLast={index === messages.length - 1} 
            />
          ))
        )}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
