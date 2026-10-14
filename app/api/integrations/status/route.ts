import { NextResponse } from 'next/server';
import { ProviderStatus } from '@/lib/types';
import { isConnected, modelName } from '@/lib/gemini';

export async function GET() {
  const timestamp = new Date().toISOString();

  const status: ProviderStatus = {
    gemini: {
      connected: isConnected,
      model: modelName,
      note: isConnected
        ? 'Connected server-side via GoogleGenAI SDK.'
        : 'GEMINI_API_KEY is not configured in server environment secrets.',
      statusCheckedAt: timestamp,
    },
    firecrawl: {
      connected: Boolean(process.env.FIRECRAWL_API_KEY && process.env.FIRECRAWL_API_KEY.trim().length > 0),
      note: process.env.FIRECRAWL_API_KEY
        ? 'Active for live job URL scraping.'
        : 'Firecrawl is not configured. Text paste and manual inputs are enabled.',
    },
    exa: {
      connected: Boolean(process.env.EXA_API_KEY && process.env.EXA_API_KEY.trim().length > 0),
      note: process.env.EXA_API_KEY
        ? 'Active for neural discovery.'
        : 'Exa is not configured. Discovery features disabled.',
    },
    hunter: {
      connected: Boolean(process.env.HUNTER_API_KEY && process.env.HUNTER_API_KEY.trim().length > 0),
      note: process.env.HUNTER_API_KEY
        ? 'Active for professional email domain search.'
        : 'Email discovery unavailable — Hunter is not configured.',
    },
    openai: {
      connected: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0),
      note: process.env.OPENAI_API_KEY
        ? 'Optional secondary provider active.'
        : 'OpenAI is not configured.',
    },
  };

  return NextResponse.json(status);
}
