import React, { useState, useRef, useEffect } from 'react';
import Editor, { EditorRef } from './components/Editor';
import { LLMPanel } from './components/LLMPanel';
import { ContextScope, LLMConfig, LLMProvider, EditorSelection, InsertPayload } from './types';

// Default document text
const WELCOME_TEXT = `# Welcome to SpecNote

This is a minimalist, split-view markdown editor designed for AI engineers.

## Features
- **Split View**: Edit on the left, collaborate with AI on the right.
- **Context Aware**: Send selections or the whole document to the LLM.
- **Clean Export**: All output respects strict structure.

## Try it out
1. Open the LLM panel (CMD/CTRL+B or use the button).
2. Select this list.
3. Ask the AI to "Convert this list to a table".
`;

function App() {
  // State
  const [content, setContent] = useState(WELCOME_TEXT);
  const [isLLMPanelOpen, setIsLLMPanelOpen] = useState(true);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: LLMProvider.GEMINI,
    model: 'gemini-3-flash-preview',
    apiKey: '',
    temperature: 0.7
  });
  
  // Selection tracking
  const [currentSelection, setCurrentSelection] = useState<EditorSelection>({ start: 0, end: 0, text: '' });
  const [contextScope, setContextScope] = useState<ContextScope>(ContextScope.SELECTION);

  // Refs
  const editorRef = useRef<EditorRef>(null);

  // Handlers
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSelectionChange = (selection: EditorSelection) => {
    setCurrentSelection(selection);
    // Auto-switch scope if selection is made, per UX requirements
    if (selection.text.length > 0) {
      setContextScope(ContextScope.SELECTION);
    } else {
      setContextScope(ContextScope.NONE);
    }
  };

  const handleInsert = (payload: InsertPayload) => {
    if (editorRef.current) {
      editorRef.current.insertText(payload.text, payload.mode);
    }
  };

  // Derived context calculation
  const getContextText = () => {
    switch (contextScope) {
      case ContextScope.SELECTION:
        return currentSelection.text;
      case ContextScope.FULL_DOC:
        return content;
      case ContextScope.PARAGRAPH:
        // Naive paragraph implementation: finding surrounding double newlines
        // In a real implementation, we'd traverse the AST or use regex from cursor pos
        return currentSelection.text || "Current paragraph detection requires cursor position logic.";
      case ContextScope.NONE:
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-gray-200 overflow-hidden font-sans">
      {/* Top Bar / Command Palette Placeholder */}
      <header className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-950 select-none">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-3 text-xs font-mono text-gray-500">untitled.md — SpecNote</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsLLMPanelOpen(!isLLMPanelOpen)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${isLLMPanelOpen ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}
            >
                {isLLMPanelOpen ? 'Hide Panel' : 'Show AI'}
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <div className="flex-1 relative overflow-auto custom-scrollbar">
             <Editor 
                ref={editorRef}
                content={content} 
                onChange={handleContentChange}
                onSelectionChange={handleSelectionChange}
             />
          </div>
          <div className="h-6 border-t border-gray-800 bg-gray-950 px-3 flex items-center justify-between text-[10px] text-gray-500">
             <span>Markdown</span>
             <span>{content.length} chars</span>
          </div>
        </div>

        {/* Splitter (Visual only for v1 MVP) */}
        {isLLMPanelOpen && (
            <div className="w-[1px] bg-gray-800 cursor-col-resize hover:bg-blue-500 transition-colors"></div>
        )}

        {/* LLM Pane */}
        {isLLMPanelOpen && (
          <div className="w-[400px] flex-shrink-0 flex flex-col h-full bg-gray-950">
             <LLMPanel 
                config={llmConfig}
                onConfigChange={setLlmConfig}
                contextText={getContextText()}
                contextScope={contextScope}
                setContextScope={setContextScope}
                onInsert={handleInsert}
             />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;