import { TranslationRequest, TranslationResponse } from '../types';

/**
 * Service module for translating text via backend API with client fallback
 */
export async function translateText(req: TranslationRequest): Promise<TranslationResponse> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
    }

    const data: TranslationResponse = await response.json();
    return data;
  } catch (error: any) {
    console.warn('Backend API request failed, attempting direct public translation fallback:', error);

    // Direct MyMemory public API fallback if server endpoint is unavailable
    try {
      const src = req.sourceLang === 'auto' ? 'autodetect' : req.sourceLang;
      const pair = `${src}|${req.targetLang}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(req.text)}&langpair=${pair}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json && json.responseData && json.responseData.translatedText) {
        return {
          translatedText: json.responseData.translatedText,
          detectedSourceLang: json.responseData.detectedLanguage || req.sourceLang,
          source: 'mymemory',
        };
      }
    } catch (fallbackErr) {
      console.error('Fallback API also failed:', fallbackErr);
    }

    throw new Error(error.message || 'Failed to communicate with translation service.');
  }
}

/**
 * Check translation server health status
 */
export async function checkServerHealth(): Promise<{ status: string; geminiEnabled: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Silent catch
  }
  return { status: 'offline', geminiEnabled: false };
}
