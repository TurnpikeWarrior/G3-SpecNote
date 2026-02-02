import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Sender } from "../types";

// In a real Electron app, we would use IPC to get this securely.
// For this demo, we use the env var or a provided key.
const getApiKey = (userKey?: string): string => {
  if (userKey && userKey.trim() !== '') return userKey;
  // Fallback to process.env for demo purposes if available
  return process.env.API_KEY || '';
};

export const streamGeminiResponse = async (
  prompt: string,
  context: string,
  apiKey: string,
  modelName: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const finalKey = getApiKey(apiKey);
  
  if (!finalKey) {
    throw new Error("API Key is missing. Please configure it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  // Construct the prompt with context
  let finalPrompt = prompt;
  if (context) {
    finalPrompt = `Context:\n${context}\n\nTask:\n${prompt}`;
  }

  // System instruction for the "Assistant" persona defined in PRD
  const systemInstruction = `You are SpecNote AI, an assistant integrated into a Markdown editor. 
  Your goal is to help draft, rewrite, summarize, and structure notes while strictly preserving Markdown syntax.
  - Headings should use # notation.
  - Lists should use - or 1. notation.
  - Code blocks should be fenced with \`\`\`.
  - Do not use conversational filler (e.g., "Here is the summary:") unless explicitly asked.
  - Output raw markdown that is ready to be inserted directly into the document.`;

  try {
    // Per instructions: use 'gemini-3-flash-preview' for basic text tasks
    const effectiveModel = modelName || 'gemini-3-flash-preview';

    const responseStream = await ai.models.generateContentStream({
      model: effectiveModel,
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let fullText = "";
    
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }

    return fullText;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response from Gemini.");
  }
};