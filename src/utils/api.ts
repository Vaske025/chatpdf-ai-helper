
import { toast } from "sonner";

// Define message types
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
}

export interface ChatResponse {
  message: Message;
}

// OpenRouter API client
export const sendChatMessage = async (
  messages: Message[],
  apiKey: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "PDF Chat Assistant"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: messages
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response");
    }

    const data = await response.json();
    
    return {
      message: {
        role: "assistant",
        content: data.choices[0].message.content
      }
    };
  } catch (error) {
    console.error("API error:", error);
    toast.error("Failed to get a response. Please try again.");
    throw error;
  }
};

// Function to send chat message with PDF context
export const sendChatMessageWithPdf = async (
  messages: Message[],
  pdfText: string,
  apiKey: string
): Promise<ChatResponse> => {
  // Create a system message with PDF context
  const systemMessage: Message = {
    role: "system",
    content: `You are a helpful assistant that answers questions based on the following PDF content: 
    
    ${pdfText}
    
    Answer questions based on this content. If the information isn't in the document, say so politely.`
  };

  // Add system message at the beginning
  const messagesWithContext = [systemMessage, ...messages];
  
  return sendChatMessage(messagesWithContext, apiKey);
};
