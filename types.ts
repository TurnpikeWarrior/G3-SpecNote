export enum ContextScope {
  NONE = 'None',
  SELECTION = 'Selection',
  PARAGRAPH = 'Current Paragraph',
  FULL_DOC = 'Full Document'
}

export enum LLMProvider {
  GEMINI = 'Google Gemini',
  LOCAL = 'Local (Ollama/Compatible)'
}

export enum Sender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  baseUrl?: string; // For local providers
  apiKey?: string; // Persisted locally
  temperature: number;
}

export interface EditorSelection {
  start: number;
  end: number;
  text: string;
}

export interface InsertPayload {
  text: string;
  mode: 'insert' | 'replace' | 'append';
}