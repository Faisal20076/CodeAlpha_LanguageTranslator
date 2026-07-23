import React, { useState } from 'react';
import { X, BookOpen, ArrowUpRight } from 'lucide-react';
import { PRESET_PHRASES } from '../data/phrases';

interface PhrasesQuickListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (text: string) => void;
}

export const PhrasesQuickList: React.FC<PhrasesQuickListProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Greetings');

  if (!isOpen) return null;

  const categories = ['Greetings', 'Travel', 'Dining', 'Emergency', 'Business'] as const;

  const filteredPhrases = PRESET_PHRASES.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Preset Phrase Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap any common phrase to load and translate immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phrase Cards */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1 custom-scrollbar">
          {filteredPhrases.map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => {
                onSelectPhrase(phrase.english);
                onClose();
              }}
              className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {phrase.english}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
