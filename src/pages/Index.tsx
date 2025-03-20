
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PdfUploader from '@/components/PdfUploader';
import Chat from '@/components/Chat';
import { PdfInfo } from '@/utils/pdf';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [activePdf, setActivePdf] = useState<PdfInfo | null>(null);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);

  // Initialize from provided key in default user message
  useEffect(() => {
    const defaultKey = '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';
    if (defaultKey) {
      setApiKey(defaultKey);
      setShowKeyInput(false);
      toast.success('API key loaded successfully');
    }
  }, []);

  const handlePdfProcessed = (pdfInfo: PdfInfo) => {
    setActivePdf(pdfInfo.id ? pdfInfo : null);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowKeyInput(false);
      toast.success('API key saved');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar for PDF upload */}
        <div className="w-full lg:w-80 lg:h-full lg:border-r border-border flex flex-col p-6 shrink-0">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">PDF Upload</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a PDF to chat with its contents
            </p>
            <PdfUploader onPdfProcessed={handlePdfProcessed} activePdf={activePdf} />
          </div>
          
          {showKeyInput ? (
            <div className="mt-auto">
              <form onSubmit={handleSaveApiKey} className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="apiKey" className="text-sm font-medium">
                    OpenRouter API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="sk-or-v1-..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90"
                >
                  Save API Key
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Key</span>
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="text-sm mt-1">•••••••••••••••••••••</div>
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="flex-1 h-full min-h-0">
          <Chat apiKey={apiKey} activePdf={activePdf} />
        </div>
      </main>
    </div>
  );
};

export default Index;
