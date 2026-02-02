import React, { useState, useRef, useEffect } from 'react';
import { ContextScope, LLMConfig, LLMProvider, Message, Sender, InsertPayload } from '../types';
import { Button } from './Button';
import { streamGeminiResponse } from '../services/geminiService';

interface LLMPanelProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  contextText: string;
  contextScope: ContextScope;
  setContextScope: (scope: ContextScope) => void;
  onInsert: (payload: InsertPayload) => void;
}

const PRESET_TEMPLATES = [
  "Summarize this section",
  "Rewrite for clarity",
  "Convert to bullet list",
  "Critique this argument"
];

export const LLMPanel: React.FC<LLMPanelProps> = ({
  config,
  onConfigChange,
  contextText,
  contextScope,
  setContextScope,
  onInsert
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      sender: Sender.MODEL,
      text: '', // Start empty
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);

    try {
      if (config.provider === LLMProvider.GEMINI) {
        await streamGeminiResponse(
          userMsg.text,
          contextText,
          config.apiKey || '',
          config.model,
          (chunk) => {
            setMessages(prev => prev.map(m => 
              m.id === modelMsgId ? { ...m, text: m.text + chunk } : m
            ));
          }
        );
      } else {
        // Mock local provider for now
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === modelMsgId ? { ...m, text: "Local provider support is a placeholder in this demo. Please use Gemini." } : m
          ));
        }, 500);
      }
    } catch (error: any) {
      setMessages(prev => prev.map(m => 
        m.id === modelMsgId ? { ...m, text: `Error: ${error.message}`, isError: true } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
        <h2 className="text-sm font-semibold text-gray-200">LLM Assistant</h2>
        <div className="flex gap-2">
            <Button variant="icon" onClick={() => setShowSettings(!showSettings)} title="Settings">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Button>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div className="p-4 border-b border-gray-800 bg-gray-900 space-y-4">
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">Provider</label>
                <select 
                    value={config.provider}
                    onChange={(e) => onConfigChange({...config, provider: e.target.value as LLMProvider})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 px-2 py-1.5 focus:border-blue-500 outline-none"
                >
                    <option value={LLMProvider.GEMINI}>Google Gemini</option>
                    <option value={LLMProvider.LOCAL}>Local (Ollama)</option>
                </select>
            </div>
            
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">Model</label>
                <input 
                    type="text" 
                    value={config.model}
                    onChange={(e) => onConfigChange({...config, model: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 px-2 py-1.5 focus:border-blue-500 outline-none"
                    placeholder="e.g. gemini-3-flash-preview"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">API Key</label>
                <input 
                    type="password" 
                    value={config.apiKey}
                    onChange={(e) => onConfigChange({...config, apiKey: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 px-2 py-1.5 focus:border-blue-500 outline-none"
                    placeholder="Leave empty to use process.env.API_KEY"
                />
            </div>
            <Button size="sm" variant="secondary" onClick={() => setShowSettings(false)} className="w-full">Done</Button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-10">
                <p className="text-sm">Select text in the editor or type a prompt to get started.</p>
                <div className="mt-4 grid grid-cols-1 gap-2">
                    {PRESET_TEMPLATES.map(t => (
                        <button key={t} onClick={() => setInput(t)} className="text-xs bg-gray-900 hover:bg-gray-800 border border-gray-800 p-2 rounded text-left transition-colors">
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        )}
        {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                <div 
                    className={`max-w-[90%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                        msg.sender === Sender.USER 
                        ? 'bg-blue-900/30 text-blue-100 border border-blue-800/50' 
                        : msg.isError 
                            ? 'bg-red-900/20 text-red-200 border border-red-800/50'
                            : 'bg-gray-800 text-gray-200 border border-gray-700'
                    }`}
                >
                    {msg.text}
                </div>
                {msg.sender === Sender.MODEL && !msg.isError && msg.text && (
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => onInsert({ text: msg.text, mode: 'insert' })} className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-blue-400 font-semibold">Insert</button>
                        <button onClick={() => onInsert({ text: msg.text, mode: 'replace' })} className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-blue-400 font-semibold">Replace</button>
                        <button onClick={() => onInsert({ text: msg.text, mode: 'append' })} className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-blue-400 font-semibold">Append</button>
                    </div>
                )}
            </div>
        ))}
        {isLoading && (
             <div className="flex items-start">
                 <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-400 animate-pulse">
                     Thinking...
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Context:</span>
                <select 
                    value={contextScope} 
                    onChange={(e) => setContextScope(e.target.value as ContextScope)}
                    className="bg-transparent text-xs text-blue-400 hover:text-blue-300 focus:outline-none cursor-pointer"
                >
                    {Object.values(ContextScope).map(scope => (
                        <option key={scope} value={scope} className="bg-gray-900 text-gray-200">{scope}</option>
                    ))}
                </select>
                {contextText.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {contextText.length} chars
                    </span>
                )}
            </div>
            <button 
                onClick={() => setShowPreview(!showPreview)} 
                className={`text-xs ${showPreview ? 'text-green-400' : 'text-gray-500'} hover:text-gray-300`}
            >
                {showPreview ? 'Hide Payload' : 'Preview'}
            </button>
        </div>

        {showPreview && (
            <div className="mb-2 p-2 bg-gray-950 border border-gray-800 rounded text-xs font-mono text-gray-400 max-h-32 overflow-y-auto">
                <div className="font-bold text-gray-500 mb-1">SYSTEM PROMPT (Included implicitly)</div>
                <div className="mb-2">You are SpecNote AI...</div>
                <div className="font-bold text-gray-500 mb-1">USER PROMPT</div>
                {contextText ? (
                    <>
                        <div className="text-yellow-700 opacity-70">Context: {contextText.substring(0, 100)}...</div>
                        <div>Task: {input}</div>
                    </>
                ) : (
                    <div>{input}</div>
                )}
            </div>
        )}

        <div className="relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Ask AI to write, rewrite, or summarize..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};