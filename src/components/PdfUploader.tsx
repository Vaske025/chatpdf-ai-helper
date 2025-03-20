
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { extractTextFromPdf, formatFileSize, type PdfInfo } from '@/utils/pdf';
import { FileText, Upload, X } from 'lucide-react';

interface PdfUploaderProps {
  onPdfProcessed: (pdfInfo: PdfInfo) => void;
  activePdf: PdfInfo | null;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ 
  onPdfProcessed,
  activePdf 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMedicalReport, setIsMedicalReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    // Check if file is a PDF
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Please upload a PDF smaller than 10MB');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const pdfInfo = await extractTextFromPdf(file);
      
      // Check if PDF might be a medical report
      const medicalKeywords = [
        "blood test", "laboratory", "lab results", "clinical", "reference range", 
        "cholesterol", "glucose", "hemoglobin"
      ];
      
      const isMedical = medicalKeywords.some(keyword => 
        pdfInfo.text.toLowerCase().includes(keyword)
      );
      
      setIsMedicalReport(isMedical);
      onPdfProcessed(pdfInfo);
      
      if (isMedical) {
        toast.success(`Medical report "${file.name}" processed successfully. Ask questions about your blood test results!`);
      } else {
        toast.success(`"${file.name}" processed successfully`);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClearPdf = () => {
    setIsMedicalReport(false);
    onPdfProcessed({
      id: '',
      name: '',
      size: 0,
      numPages: 0,
      text: ''
    });
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
      />
      
      {activePdf && activePdf.id ? (
        <Card className="w-full p-4 mb-4 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{activePdf.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(activePdf.size)} • {activePdf.numPages} {activePdf.numPages === 1 ? 'page' : 'pages'}
                  {isMedicalReport && <span className="ml-1 text-emerald-500">• Medical Report</span>}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearPdf}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        <div
          className={`w-full mb-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center py-6 px-4 cursor-pointer">
            <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={20} />
              )}
            </div>
            <p className="mb-1 text-sm font-medium">
              {isProcessing ? 'Processing PDF...' : 'Upload a PDF file'}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-emerald-600 mt-2 text-center">
              ✨ Now with Blood Test Report Analysis! ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
