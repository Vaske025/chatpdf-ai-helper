
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface PdfInfo {
  id: string;
  name: string;
  size: number;
  numPages: number;
  text: string;
}

// Extract text from PDF
export const extractTextFromPdf = async (file: File): Promise<PdfInfo> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let fullText = "";
    
    // Process each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      fullText += pageText + "\n\n";
    }
    
    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      numPages,
      text: fullText.trim()
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    toast.error("Failed to process PDF. Please try another file.");
    throw error;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};
