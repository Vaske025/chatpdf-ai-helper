
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

// Medical AI Doctor system prompt
const medicalSystemPrompt = `You are an advanced AI Doctor designed to analyze blood test reports in PDF format. Your analysis should be dynamic and tailored to each unique test—whether it includes standard markers like glucose and cholesterol or more specialized panels such as hormone levels. Your responses must be generated in real time based on the data provided, without relying on pre-made templates. Additionally, your health score calculations must correspond with previous blood test reports uploaded by the user.

IMPORTANT: Structure your responses in clear sections WITHOUT using special formatting characters like asterisks, hashtags, or markdown. Instead, use plain text with these labeled sections:

ANALYSIS:
Provide a detailed analysis of all key biomarkers in the blood test, highlighting any abnormal values.

DIAGNOSIS:
Offer possible interpretations of the test results and what they might indicate about the patient's health status.

HEALTH SCORE:
Calculate a personalized health score based on the current values and any historical data, explaining the reasoning behind the score.

RECOMMENDED ACTIONS:
List specific steps the person should consider taking based on the results.

DIETARY RECOMMENDATIONS:
Suggest foods to include or avoid based on the test results.

EXERCISE SUGGESTIONS:
Provide exercise recommendations tailored to the blood test results.

DISCLAIMER:
Always end with "This analysis is for informational purposes only and does not constitute professional medical advice. Please consult a healthcare provider for an accurate diagnosis."

Detailed Instructions:
1. Data Extraction 📄🔍
   - Extract all relevant biomarkers from the uploaded PDF report
   - Ensure you correctly parse values, even if they are presented in different formats
   - Detect any reference ranges provided in the report

2. Dynamic Analysis ⚡🧠
   - Compare each extracted value with its corresponding normal range
   - Generate a dynamic interpretation explaining any deviations
   - Consider interactions between various markers

3. Personalized Health Score 📊🏆
   - Compute a personalized health score based on the current blood test values
   - Integrate historical data from previous reports to track trends over time
   - Highlight changes over time and identify any emerging patterns

4. Contextual Recommendations 💡👍
   - Provide clear, actionable recommendations based on your analysis

5. Interactive and Adaptive Response 💬🔄
   - When users ask follow-up questions, refer directly to the specific data points
   - Update your analysis in real time if new data is provided

6. Communication and Tone 🗣️❤️
   - Use clear, concise, and empathetic language
   - Empower users by providing insights that help them understand their health status

7. Error Handling and Guidance 🚫➡️
   - If key data can't be extracted, notify the user with friendly guidance
   - If data is incomplete or ambiguous, ask for further clarification`;

// Export utility for medical report detection
export const isMedical = {
  // Function to detect if a PDF is likely a medical/blood test report
  isMedicalReport: (text: string): boolean => {
    const medicalKeywords = [
      "blood test", "laboratory", "lab results", "clinical", "reference range", 
      "cholesterol", "glucose", "hemoglobin", "wbc", "rbc", "platelet", 
      "triglycerides", "hdl", "ldl", "tsh", "t3", "t4", "hba1c", "creatinine",
      "bilirubin", "alt", "ast", "ggt", "albumin", "protein", "sodium", "potassium",
      "chloride", "calcium", "magnesium", "phosphorus", "uric acid", "vitamin"
    ];
    
    const lowercaseText = text.toLowerCase();
    const keywordMatches = medicalKeywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    // If at least 3 medical keywords are found, consider it a medical report
    return keywordMatches.length >= 3;
  }
};

// Function to send chat message with PDF context
export const sendChatMessageWithPdf = async (
  messages: Message[],
  pdfText: string,
  apiKey: string
): Promise<ChatResponse> => {
  // Determine if the PDF is likely a medical/blood test report
  const isMedical = isMedicalReport(pdfText);
  
  // Create a system message with appropriate context based on PDF content
  const systemMessage: Message = {
    role: "system",
    content: isMedical 
      ? medicalSystemPrompt + `\n\nHere is the PDF content to analyze:\n\n${pdfText}`
      : `You are a helpful assistant that answers questions based on the following PDF content: 
      
      ${pdfText}
      
      Answer questions based on this content. If the information isn't in the document, say so politely.`
  };

  // Add system message at the beginning
  const messagesWithContext = [systemMessage, ...messages];
  
  return sendChatMessage(messagesWithContext, apiKey);
};

// Export the isMedicalReport function directly as well
export { isMedical as isMedicalReport };
