
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PdfUploader from '@/components/PdfUploader';
import Chat from '@/components/Chat';
import { PdfInfo } from '@/utils/pdf';
import { toast } from 'sonner';

const Index: React.FC = () => {
  // Hardcode the API key to prevent frontend changes
  const apiKey = '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';
  const [activePdf, setActivePdf] = useState<PdfInfo | null>(null);

  useEffect(() => {
    // Notify that the API key is loaded
    toast.success('API key loaded successfully');
  }, []);

  const handlePdfProcessed = (pdfInfo: PdfInfo) => {
    setActivePdf(pdfInfo.id ? pdfInfo : null);
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
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status</span>
              <span className="text-xs text-emerald-500 font-medium">Connected</span>
            </div>
            <div className="text-sm mt-1 text-muted-foreground">Using OpenRouter API</div>
          </div>
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
