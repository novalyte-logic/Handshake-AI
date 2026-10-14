/**
 * Server-side Firecrawl AI API client for company research grounding.
 * Strictly server-side execution to ensure zero personal user data transmission.
 */

export interface FirecrawlScrapeResult {
  success: boolean;
  markdown?: string;
  url?: string;
  error?: string;
}

export async function scrapeCompanyWithFirecrawl(targetUrl: string): Promise<FirecrawlScrapeResult> {
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

  if (!firecrawlApiKey || !firecrawlApiKey.trim()) {
    return {
      success: false,
      error: 'Firecrawl API key not configured in environment variables.',
    };
  }

  if (!targetUrl || !targetUrl.startsWith('http') || targetUrl.includes('example.com')) {
    return {
      success: false,
      error: 'Invalid or fictional target URL for live Firecrawl scrape.',
    };
  }

  try {
    // Privacy Guardrail: Ensure targetUrl is strictly public company domain or posting URL.
    // Never transmit user PII or candidate profile data to Firecrawl.
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey.trim()}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 12000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Firecrawl API responded with status ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    if (data.success && data.data?.markdown) {
      return {
        success: true,
        markdown: data.data.markdown,
        url: targetUrl,
      };
    }

    return {
      success: false,
      error: 'Firecrawl returned successful status but missing markdown content.',
    };
  } catch (err: any) {
    console.error('Firecrawl API client error:', err);
    return {
      success: false,
      error: err?.message || 'Unknown network error during Firecrawl scrape.',
    };
  }
}
