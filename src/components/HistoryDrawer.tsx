import React, { useState } from 'react';
import { X, Search, Star, Trash2, Download, Copy, ArrowRight, Clock, CornerUpLeft } from 'lucide-react';
import { TranslationHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationHistoryItem[];
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onRestoreItem: (item: TranslationHistoryItem) => void;
  onCopyText: (text: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onToggleFavorite,
  onDeleteItem,
  onClearHistory,
  onRestoreItem,
  onCopyText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  if (!isOpen) return null;

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceLangName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetLangName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFav = showFavoritesOnly ? item.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  // Export history to JSON file download
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `translation_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Translation History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Toggle Favorites Tab */}
              <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-700/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    !showFavoritesOnly
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                    showFavoritesOnly
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Starred ({history.filter((h) => h.isFavorite).length})</span>
                </button>
              </div>

              {/* Export & Clear Actions */}
              <div className="flex items-center space-x-1">
                {history.length > 0 && (
                  <button
                    onClick={handleExportJSON}
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Export history as JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No history items found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {showFavoritesOnly
                    ? 'Star translations to save them as favorites!'
                    : 'Translated phrases will automatically appear here.'}
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 group"
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>{item.sourceLangName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{item.targetLangName}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                        title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.isFavorite
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-400 group-hover:text-amber-400'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1.5 text-sm">
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2">
                      {item.sourceText}
                    </p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium line-clamp-2 bg-indigo-50/60 dark:bg-indigo-950/40 p-2 rounded-xl">
                      {item.translatedText}
                    </p>
                  </div>

                  {/* Item Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onCopyText(item.translatedText)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Copy translation"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => onRestoreItem(item)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-xs"
                        title="Restore into translator"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                        <span>Use</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
