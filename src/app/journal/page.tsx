"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText } from "lucide-react";
import { JournalEditor } from "@/components/JournalEditor";
import { usePractice } from "@/contexts/PracticeContext";

interface JournalEntry {
  id: string;
  content: string;
  htmlContent: string;
  createdAt: Date;
}

export default function Journal() {
  const { sessions } = usePractice();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const streak = sessions.length > 0 ? Math.min(sessions.length, 7) : 0;

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journal-entries");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed.map((e: JournalEntry) => ({
        ...e,
        createdAt: new Date(e.createdAt),
      })));
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem("journal-entries", JSON.stringify(entries));
  }, [entries]);

  const handleSave = async (content: string, htmlContent: string) => {
    if (editingEntry) {
      setEntries(entries.map(e => 
        e.id === editingEntry.id 
          ? { ...e, content, htmlContent }
          : e
      ));
      setEditingEntry(null);
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content,
        htmlContent,
        createdAt: new Date(),
      };
      setEntries([newEntry, ...entries]);
    }
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEditorOpen(true);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Layout streak={streak}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Journal</h1>
          <Button 
            size="icon" 
            onClick={() => setIsEditorOpen(true)}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1 text-black">No entries yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Start documenting your practice journey
            </p>
            <Button onClick={() => setIsEditorOpen(true)} className="bg-black text-white hover:bg-gray-800">
              Write your first entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card 
                key={entry.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow group bg-white border-gray-200"
                onClick={() => handleEdit(entry)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm text-black line-clamp-3 prose prose-sm"
                      style={{ 
                        fontFamily: 'InterVariable, system-ui, sans-serif',
                        fontWeight: 400,
                      }}
                      dangerouslySetInnerHTML={{ __html: entry.htmlContent }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <JournalEditor
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setEditingEntry(null); }}
        onSave={handleSave}
        initialContent={editingEntry?.htmlContent}
      />
    </Layout>
  );
}
