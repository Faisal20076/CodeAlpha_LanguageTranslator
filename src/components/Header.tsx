import React from 'react';
import { Languages, Moon, Sun, History, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenPhrases: () => void;
  historyCount: number;
  geminiEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  onOpenPhrases,
  historyCount,
  geminiEnabled,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                LINGUA AI
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 mr-1" />
                {geminiEnabled ? 'Gemini 3.6 Flash' : 'Free AI Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Instant, natural translations across 50+ world languages
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Preset Phrases Quick Library */}
          <button
            onClick={onOpenPhrases}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Browse common phrase templates"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">Preset Phrases</span>
          </button>

          {/* Translation History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View translation history"
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full min-w-[20px]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
