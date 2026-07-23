import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { ALL_LANGUAGES, AUTO_DETECT_LANGUAGE, POPULAR_LANGUAGES } from '../data/languages';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  allowAutoDetect?: boolean;
  label?: string;
  detectedLanguageName?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  allowAutoDetect = false,
  label,
  detectedLanguageName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Combine options based on auto-detect permission
  const availableLanguages = allowAutoDetect
    ? [AUTO_DETECT_LANGUAGE, ...ALL_LANGUAGES]
    : ALL_LANGUAGES;

  // Filter languages based on search query
  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lang.nativeName && lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lang: Language) => {
    onSelectLanguage(lang);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </span>
      )}

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <span className="text-lg leading-none">{selectedLanguage.flag || '🌐'}</span>
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-semibold text-sm truncate">{selectedLanguage.name}</span>
            {selectedLanguage.code === 'auto' && detectedLanguageName && (
              <span className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md font-medium border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Detected: {detectedLanguageName}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 max-h-96 flex flex-col transition-all duration-150 animate-in fade-in zoom-in-95">
          {/* Search Box */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 50+ languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Popular Language Badges */}
          {!searchQuery && (
            <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Popular Languages
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allowAutoDetect && (
                  <button
                    type="button"
                    onClick={() => handleSelect(AUTO_DETECT_LANGUAGE)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                      selectedLanguage.code === 'auto'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>✨</span>
                    <span>Auto</span>
                  </button>
                )}
                {POPULAR_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                      selectedLanguage.code === lang.code
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Language List */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-0.5 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No languages found matching "{searchQuery}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <span className="text-base">{lang.flag || '🌐'}</span>
                      <span className="truncate">{lang.name}</span>
                      {lang.nativeName && lang.nativeName !== lang.name && (
                        <span className="text-xs text-slate-400 font-normal truncate">
                          ({lang.nativeName})
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
