import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TranslationPanel } from './components/TranslationPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PhrasesQuickList } from './components/PhrasesQuickList';
import { Toast } from './components/Toast';
import {
  Language,
  TranslationHistoryItem,
  TranslationResponse,
  TranslationTone,
  ToastMessage,
} from './types';
import { ALL_LANGUAGES, AUTO_DETECT_LANGUAGE } from './data/languages';
import { translateText, checkServerHealth } from './services/api';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ai_translator_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Languages selection state
  const [sourceLang, setSourceLang] = useState<Language>(AUTO_DETECT_LANGUAGE);
  const [targetLang, setTargetLang] = useState<Language>(
    ALL_LANGUAGES.find((l) => l.code === 'es') || ALL_LANGUAGES[1]
  );

  // Text inputs & translation outputs
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [translationResponse, setTranslationResponse] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<TranslationTone>('neutral');
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false);

  // History & drawer states
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_translator_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPhrasesOpen, setIsPhrasesOpen] = useState<boolean>(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Server health state
  const [geminiEnabled, setGeminiEnabled] = useState<boolean>(true);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Debounce ref for auto-translate
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Apply Dark Mode Class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_translator_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_translator_theme', 'light');
    }
  }, [darkMode]);

  // Persist History to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_translator_history', JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to save history to localStorage:', err);
    }
  }, [history]);

  // Check Server Health on Mount
  useEffect(() => {
    checkServerHealth().then((res) => {
      setGeminiEnabled(res.geminiEnabled);
    });
  }, []);

  // Toast Helper
  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Perform Translation Logic
  const handleTranslate = useCallback(
    async (overrideText?: string, overrideTone?: TranslationTone) => {
      const textToTranslate = overrideText !== undefined ? overrideText : inputText;
      const toneToUse = overrideTone || selectedTone;

      if (!textToTranslate.trim()) {
        setTranslatedText('');
        setTranslationResponse(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await translateText({
          text: textToTranslate,
          sourceLang: sourceLang.code,
          targetLang: targetLang.code,
          tone: toneToUse,
        });

        setTranslatedText(res.translatedText);
        setTranslationResponse(res);

        // Update auto-detected language if applicable
        let detectedSourceLangName = res.detectedSourceLangName || sourceLang.name;
        if (sourceLang.code === 'auto' && res.detectedSourceLang) {
          const match = ALL_LANGUAGES.find(
            (l) => l.code.toLowerCase() === res.detectedSourceLang?.toLowerCase()
          );
          if (match) {
            detectedSourceLangName = match.name;
          }
        }

        // Add to history if unique or new
        const newHistoryItem: TranslationHistoryItem = {
          id: Date.now().toString(),
          sourceText: textToTranslate,
          translatedText: res.translatedText,
          sourceLang: sourceLang.code,
          sourceLangName: sourceLang.code === 'auto' ? `Auto (${detectedSourceLangName})` : sourceLang.name,
          targetLang: targetLang.code,
          targetLangName: targetLang.name,
          timestamp: Date.now(),
          isFavorite: false,
          tone: toneToUse,
          notes: res.notes,
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // Keep last 50 items
      } catch (err: any) {
        console.error('Translation error:', err);
        addToast('error', 'Translation Failed', err.message || 'Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, selectedTone, sourceLang, targetLang]
  );

  // Auto Translate Debounce Effect
  useEffect(() => {
    if (!autoTranslate || !inputText.trim()) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleTranslate();
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceLang, targetLang, autoTranslate, handleTranslate]);

  // Clear Input & Output
  const handleClearAll = () => {
    setInputText('');
    setTranslatedText('');
    setTranslationResponse(null);
    addToast('info', 'Text Cleared');
  };

  // Toggle History Item Favorite
  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Delete History Item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    addToast('info', 'Item Removed from History');
  };

  // Clear All History
  const handleClearHistory = () => {
    setHistory([]);
    addToast('info', 'History Cleared');
  };

  // Restore History Item into Translator
  const handleRestoreHistoryItem = (item: TranslationHistoryItem) => {
    const srcMatch = ALL_LANGUAGES.find((l) => l.code === item.sourceLang) || AUTO_DETECT_LANGUAGE;
    const tgtMatch = ALL_LANGUAGES.find((l) => l.code === item.targetLang) || targetLang;

    setSourceLang(srcMatch);
    setTargetLang(tgtMatch);
    setInputText(item.sourceText);
    setTranslatedText(item.translatedText);
    setIsHistoryOpen(false);
    addToast('success', 'Loaded into Translator');
  };

  // Copy text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied to Clipboard');
  };

  // Text to Speech
  const handleSpeakText = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      addToast('warning', 'Speech Synthesis Not Supported', 'Your browser does not support text-to-speech.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'auto' ? 'en-US' : langCode;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      addToast('error', 'Speech Error', 'Failed to play speech audio.');
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPhrases={() => setIsPhrasesOpen(true)}
        historyCount={history.length}
        geminiEnabled={geminiEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Main Translation Workbench */}
        <TranslationPanel
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceLangChange={setSourceLang}
          onTargetLangChange={setTargetLang}
          inputText={inputText}
          onInputTextChange={setInputText}
          translatedText={translatedText}
          translationResponse={translationResponse}
          isLoading={isLoading}
          onTranslate={handleTranslate}
          onClearAll={handleClearAll}
          selectedTone={selectedTone}
          onToneChange={setSelectedTone}
          autoTranslate={autoTranslate}
          onToggleAutoTranslate={() => setAutoTranslate(!autoTranslate)}
          onCopyText={handleCopyText}
          onSpeakText={handleSpeakText}
          isSpeaking={isSpeaking}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          LINGUA AI &bull; Powered by Gemini AI &amp; Multilingual Services
        </p>
      </footer>

      {/* Side History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onToggleFavorite={handleToggleFavorite}
        onDeleteItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onRestoreItem={handleRestoreHistoryItem}
        onCopyText={handleCopyText}
      />

      {/* Preset Phrases Quick Library Modal */}
      <PhrasesQuickList
        isOpen={isPhrasesOpen}
        onClose={() => setIsPhrasesOpen(false)}
        onSelectPhrase={(phraseText) => {
          setInputText(phraseText);
          handleTranslate(phraseText);
        }}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
