import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Volume2,
  X,
  Sparkles,
  Clipboard,
  Loader2,
  Check,
  Zap,
  Info,
  BookOpenText,
} from 'lucide-react';
import { Language, TranslationTone, TranslationResponse } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface TranslationPanelProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceLangChange: (lang: Language) => void;
  onTargetLangChange: (lang: Language) => void;
  inputText: string;
  onInputTextChange: (text: string) => void;
  translatedText: string;
  translationResponse: TranslationResponse | null;
  isLoading: boolean;
  onTranslate: (overrideText?: string, overrideTone?: TranslationTone) => void;
  onClearAll: () => void;
  selectedTone: TranslationTone;
  onToneChange: (tone: TranslationTone) => void;
  autoTranslate: boolean;
  onToggleAutoTranslate: () => void;
  onCopyText: (text: string) => void;
  onSpeakText: (text: string, langCode: string) => void;
  isSpeaking: boolean;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  inputText,
  onInputTextChange,
  translatedText,
  translationResponse,
  isLoading,
  onTranslate,
  onClearAll,
  selectedTone,
  onToneChange,
  autoTranslate,
  onToggleAutoTranslate,
  onCopyText,
  onSpeakText,
  isSpeaking,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to translate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  // Swap Languages Handler
  const handleSwap = () => {
    if (sourceLang.code === 'auto') {
      // If source was auto-detect, set source to detected or default target language
      const detectedCode = translationResponse?.detectedSourceLang || 'en';
      onSourceLangChange(targetLang);
      onTargetLangChange(sourceLang);
    } else {
      setIsSwapping(true);
      const tempLang = sourceLang;
      onSourceLangChange(targetLang);
      onTargetLangChange(tempLang);

      // If translated text exists, swap translated text into input box
      if (translatedText) {
        onInputTextChange(translatedText);
      }

      setTimeout(() => setIsSwapping(false), 300);
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onInputTextChange(text);
        if (autoTranslate) {
          onTranslate(text);
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Copy translated text with visual checkmark feedback
  const handleCopyTranslated = () => {
    if (!translatedText) return;
    onCopyText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tones: { id: TranslationTone; label: string; icon: string }[] = [
    { id: 'neutral', label: 'Standard', icon: '💬' },
    { id: 'formal', label: 'Formal / Professional', icon: '👔' },
    { id: 'informal', label: 'Casual / Friendly', icon: '😊' },
    { id: 'simplified', label: 'Simplified', icon: '✨' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top Header Controls (Language Pickers & Swap Button) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Source Language Dropdown */}
          <LanguageSelector
            label="From Language"
            selectedLanguage={sourceLang}
            onSelectLanguage={onSourceLangChange}
            allowAutoDetect={true}
            detectedLanguageName={translationResponse?.detectedSourceLangName}
          />

          {/* Swap Languages Button */}
          <div className="flex justify-center my-1 md:my-0 md:pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className={`p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs ${
                isSwapping ? 'rotate-180 scale-110' : ''
              }`}
              title="Swap Languages & Text"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Target Language Dropdown */}
          <LanguageSelector
            label="To Language"
            selectedLanguage={targetLang}
            onSelectLanguage={onTargetLangChange}
            allowAutoDetect={false}
          />
        </div>

        {/* Tone Selector Options */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tone:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onToneChange(t.id);
                    if (inputText.trim()) {
                      onTranslate(inputText, t.id);
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1 ${
                    selectedTone === t.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Translate Live Switch */}
          <label className="inline-flex items-center cursor-pointer space-x-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Auto-translate
            </span>
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={onToggleAutoTranslate}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Main Dual Translation Panels (Input Text Area + Output Translated Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Input Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] transition-colors relative">
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                Input Text ({sourceLang.name})
              </span>
              {inputText && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center space-x-1 p-1 rounded-lg transition-colors"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => onInputTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or paste text to translate... (e.g. 'Hello, how are you?')"
              className="w-full flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-lg resize-none border-0 focus:outline-none focus:ring-0 p-0 leading-relaxed custom-scrollbar"
              rows={6}
            />
          </div>

          {/* Input Footer Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>

              {inputText && (
                <button
                  type="button"
                  onClick={() => onSpeakText(inputText, sourceLang.code)}
                  className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Listen input text"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {inputText.length} / 5000 chars
            </div>
          </div>
        </div>

        {/* Target Output Box */}
        <div className="bg-slate-50/90 dark:bg-slate-900/90 rounded-3xl p-5 shadow-xl border border-indigo-100 dark:border-slate-800 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] transition-colors relative">
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center">
                Translation ({targetLang.name})
              </span>
              {translationResponse?.source && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100/80 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {translationResponse.source === 'gemini' ? 'AI Enhanced' : 'Standard API'}
                </span>
              )}
            </div>

            {/* Content Display / Loading State */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-10">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-400 font-medium animate-pulse">
                  Translating text into {targetLang.name}...
                </p>
              </div>
            ) : translatedText ? (
              <div className="flex-1 space-y-3">
                <p className="text-slate-900 dark:text-white text-base sm:text-lg font-medium leading-relaxed select-text">
                  {translatedText}
                </p>

                {/* Pronunciation Guide if available */}
                {translationResponse?.pronunciation && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <span className="font-semibold uppercase tracking-wider text-[10px] block text-indigo-400">
                      Pronunciation:
                    </span>
                    {translationResponse.pronunciation}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic py-10">
                Translation output will appear here
              </div>
            )}
          </div>

          {/* Output Footer Action Bar */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {translatedText && (
                <>
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyTranslated}
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-xs"
                    title="Copy translated text"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Text To Speech Button */}
                  <button
                    type="button"
                    onClick={() => onSpeakText(translatedText, targetLang.code)}
                    className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors font-medium ${
                      isSpeaking
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="Read translation aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                  </button>
                </>
              )}
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono">Ctrl + Enter</kbd> to translate
            </span>
          </div>
        </div>
      </div>

      {/* AI Language Notes & Alternative Phrasings (When provided by AI) */}
      {translationResponse && (translationResponse.notes || (translationResponse.alternatives && translationResponse.alternatives.length > 0)) && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 rounded-3xl p-4 sm:p-5 border border-indigo-200/60 dark:border-indigo-800/40 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
            <BookOpenText className="w-4 h-4" />
            <span>AI Translation Insights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
            {translationResponse.notes && (
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                  Grammar & Context Notes:
                </span>
                <p className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                  {translationResponse.notes}
                </p>
              </div>
            )}

            {translationResponse.alternatives && translationResponse.alternatives.length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                  Alternative Translations:
                </span>
                <ul className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-800 space-y-1 list-disc list-inside">
                  {translationResponse.alternatives.map((alt, idx) => (
                    <li key={idx} className="font-medium">
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Translate Trigger Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => onTranslate()}
          disabled={isLoading || !inputText.trim()}
          className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Translate Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
