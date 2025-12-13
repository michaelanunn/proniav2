"use client";

import { useState, useRef, useEffect } from "react";
import { X, Bold, Italic, Underline } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JournalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, htmlContent: string) => void;
  initialContent?: string;
}

export const JournalEditor = ({
  isOpen,
  onClose,
  onSave,
  initialContent = "",
}: JournalEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.focus();
      if (initialContent) {
        editorRef.current.innerHTML = initialContent;
        setIsEmpty(false);
      }
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setIsEmpty(text.trim() === "");
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!editorRef.current || isEmpty) return;
    
    setIsSaving(true);
    const htmlContent = editorRef.current.innerHTML;
    const textContent = editorRef.current.textContent || "";
    
    await onSave(textContent, htmlContent);
    setIsSaving(false);
    
    // Reset editor
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setIsEmpty(true);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">New Journal Entry</h2>
          <Button
            onClick={handleSave}
            disabled={isEmpty || isSaving}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-white font-semibold px-4 py-1 h-8 rounded-md disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => execCommand("bold")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => execCommand("italic")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => execCommand("underline")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Editor */}
        <div className="relative min-h-[300px] max-h-[60vh] overflow-y-auto">
          {isEmpty && (
            <div className="absolute inset-0 px-6 py-4 pointer-events-none">
              <span className="text-gray-400 text-lg" style={{ fontFamily: 'InterVariable, system-ui, sans-serif' }}>
                What did you practice today...
              </span>
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[300px] px-6 py-4 text-gray-900 text-lg outline-none"
            style={{ 
              fontFamily: 'InterVariable, system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 400,
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Press Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;

