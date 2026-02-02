import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { EditorSelection } from '../types';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onSelectionChange: (selection: EditorSelection) => void;
}

export interface EditorRef {
  insertText: (text: string, mode: 'insert' | 'replace' | 'append') => void;
  getText: () => string;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ content, onChange, onSelectionChange }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getText: () => content,
    insertText: (textToInsert: string, mode: 'insert' | 'replace' | 'append') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;

      let newText = '';
      let newCursorPos = 0;

      switch (mode) {
        case 'insert':
          newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
          newCursorPos = start + textToInsert.length;
          break;
        case 'replace':
          newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
          newCursorPos = start + textToInsert.length;
          break;
        case 'append':
          newText = currentText + '\n\n' + textToInsert;
          newCursorPos = newText.length;
          break;
      }

      onChange(newText);
      
      // We need to wait for render to update cursor
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    }
  }));

  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value.substring(start, end);
    onSelectionChange({ start, end, text });
  };

  // Basic auto-resize or scroll handling could go here. 
  // For SpecNote, we want a clean, full-height textarea with custom typography.
  
  return (
    <div className="w-full h-full bg-[#0d1117] relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onClick={handleSelect}
        onKeyUp={handleSelect}
        className="w-full h-full p-8 resize-none bg-transparent text-gray-200 outline-none font-mono text-base leading-relaxed"
        spellCheck={false}
        placeholder="# Start writing here..."
      />
    </div>
  );
});

export default Editor;