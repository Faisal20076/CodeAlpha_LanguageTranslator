import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI Client conditionally
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiEnabled: hasGemini,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Fallback translation using MyMemory Free API
 */
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string) {
  const src = sourceLang === 'auto' ? 'autodetect' : sourceLang;
  const pair = `${src}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data || !data.responseData) {
    throw new Error('Invalid response structure from translation service.');
  }

  const translatedText = data.responseData.translatedText || text;
  const detectedLang = data.responseData.detectedLanguage || (sourceLang !== 'auto' ? sourceLang : 'en');

  return {
    translatedText,
    detectedSourceLang: detectedLang,
    source: 'mymemory' as const,
  };
}

/**
 * Main translation endpoint
 */
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, tone = 'neutral' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text to translate is required' });
    }

    if (!targetLang) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `You are an expert multilingual translator. 
Translate the following text.
Source Language: ${sourceLang === 'auto' ? 'Auto-Detect' : sourceLang}
Target Language: ${targetLang}
Desired Tone / Style: ${tone}

Text to translate:
"""
${text}
"""

Instructions:
1. Provide an accurate, natural translation in ${targetLang}.
2. If Source Language is Auto-Detect, identify the source language ISO code (e.g., 'es', 'fr', 'zh') and full English name.
3. Provide optional romanization/pronunciation guide if helpful (especially for non-Latin scripts like Japanese, Chinese, Arabic, Russian, Hindi, etc.).
4. Provide 1-3 alternative natural translations or synonyms if applicable.
5. Provide brief linguistic or cultural usage notes if relevant.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: {
                  type: Type.STRING,
                  description: 'The translated text in target language',
                },
                detectedSourceLang: {
                  type: Type.STRING,
                  description: 'Detected source language ISO code (e.g. en, es, ja)',
                },
                detectedSourceLangName: {
                  type: Type.STRING,
                  description: 'Detected source language name in English (e.g. Spanish)',
                },
                pronunciation: {
                  type: Type.STRING,
                  description: 'Phonetic or romanized pronunciation guide if applicable',
                },
                alternatives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Alternative phrasing or synonym translations',
                },
                notes: {
                  type: Type.STRING,
                  description: 'Brief usage context or grammar notes',
                },
              },
              required: ['translatedText'],
            },
          },
        });

        const rawText = response.text?.trim();
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return res.json({
            translatedText: parsed.translatedText,
            detectedSourceLang: parsed.detectedSourceLang || (sourceLang !== 'auto' ? sourceLang : 'en'),
            detectedSourceLangName: parsed.detectedSourceLangName || '',
            pronunciation: parsed.pronunciation || '',
            alternatives: parsed.alternatives || [],
            notes: parsed.notes || '',
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini translation failed, falling back to MyMemory API:', geminiError);
      }
    }

    // Fallback if Gemini key missing or call failed
    const fallbackResult = await translateWithMyMemory(text, sourceLang, targetLang);
    return res.json(fallbackResult);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to translate text. Please try again.',
    });
  }
});

async function startServer() {
  // Vite middleware for dev mode vs static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Language Translator server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
