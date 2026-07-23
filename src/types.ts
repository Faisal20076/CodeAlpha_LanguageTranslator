/**
 * Data structures and types for AI Language Translator
 */

export interface Language {
  code: string; // ISO language code or 'auto'
  name: string; // English display name
  nativeName?: string; // Native language name
  flag?: string; // Country flag emoji
}

export type TranslationTone = 'neutral' | 'formal' | 'informal' | 'casual' | 'simplified';

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  tone?: TranslationTone;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLang?: string;
  detectedSourceLangName?: string;
  pronunciation?: string;
  alternatives?: string[];
  notes?: string;
  source: 'gemini' | 'mymemory' | 'fallback';
  error?: string;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  sourceLangName: string;
  targetLang: string;
  targetLangName: string;
  timestamp: number;
  isFavorite: boolean;
  tone?: TranslationTone;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}
