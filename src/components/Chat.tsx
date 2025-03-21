import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import Message, { TypingIndicator } from './Message';
import { Message as MessageType, sendChatMessage, sendChatMessageWithPdf, isMedical } from '@/utils/api';
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
  const [isMedicalDoc, setIsMedicalDoc] = useState(false);
  const [autoAnalysisPerformed, setAutoAnalysisPerformed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if PDF is a medical report whenever activePdf changes
  useEffect(() => {
    if (activePdf && activePdf.text) {
      const medical = isMedical.isMedicalReport(activePdf.text);
      setIsMedicalDoc(medical);
      
      // Reset auto-analysis flag when a new PDF is loaded
      setAutoAnalysisPerformed(false);
    } else {
      setIsMedicalDoc(false);
      setAutoAnalysisPerformed(false);
    }
  }, [activePdf]);

  // Auto-analyze medical reports
  useEffect(() => {
    if (isMedicalDoc && activePdf && activePdf.text && !autoAnalysisPerformed && messages.length === 0) {
      const performAutoAnalysis = async () => {
        setIsLoading(true);
        setAutoAnalysisPerformed(true);
        
        try {
          const userMessage: MessageType = {
            role: 'user',
            content: 'Analyze this blood test report in detail'
          };
          
          setMessages(prev => [...prev, userMessage]);
          
          const response = await sendChatMessageWithPdf(
            [userMessage],
            activePdf.text,
            apiKey
          );
          
          setMessages(prev => [...prev, response.message]);
        } catch (error) {
          console.error('Error auto-analyzing medical report:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      performAutoAnalysis();
    }
  }, [isMedicalDoc, activePdf, autoAnalysisPerformed, messages.length, apiKey]);

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
      {isMedicalDoc ? (
        <>
          <p className="text-emerald-600 font-medium mb-2">
            🩺 Medical Report Analysis Activated 🩺
          </p>
          <p className="text-muted-foreground max-w-md">
            I've detected a blood test report in "{activePdf?.name}". Ask me to analyze your results or provide specific health insights.
          </p>
          <div className="mt-4 text-xs max-w-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-md">
            <p className="text-emerald-800 dark:text-emerald-300">
              Try questions like:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
              <li>Analyze my blood test results</li>
              <li>Are any of my values outside the normal range?</li>
              <li>What does my cholesterol level mean?</li>
              <li>Calculate my health score</li>
            </ul>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground max-w-md">
          {activePdf && activePdf.text 
            ? `I'll answer questions based on the PDF "${activePdf.name}"`
            : "Upload a PDF or just start chatting for general assistance"}
        </p>
      )}
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
            placeholder={isMedicalDoc ? "Ask about your blood test results..." : "Type your message..."}
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
