import { GoogleGenAI } from '@google/genai';

// Server-side model configuration constants
export const GEMINI_PRIMARY_MODEL = 'gemini-3.8-flash';
export const GEMINI_REASONING_MODEL = 'gemini-4-argon';

export function getGeminiClient(): {
  ai: GoogleGenAI;
  isConnected: boolean;
  modelName: string;
} {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConnected = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0);

  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return {
    ai,
    isConnected,
    modelName: `${GEMINI_PRIMARY_MODEL} & ${GEMINI_REASONING_MODEL}`,
  };
}

export const { ai, isConnected, modelName } = getGeminiClient();
