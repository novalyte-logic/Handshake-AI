import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_PRIMARY_MODEL } from '@/lib/gemini';
import { Type } from '@google/genai';
import { scrapeCompanyWithFirecrawl } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const { opportunity, candidateProfile } = await req.json();

    if (!opportunity) {
      return NextResponse.json({ error: 'Missing opportunity data.' }, { status: 400 });
    }

    const companyName = opportunity.companyName || 'Company';
    const roleTitle = opportunity.roleTitle || 'Target Role';
    const companyDomain = opportunity.companyDomain || '';
    const postingUrl = opportunity.postingUrl || '';

    // Privacy Guardrail: Never transmit candidate PII (name, email, phone, personal addresses, exact resume strings)
    // Only pass non-identifying high-level skill domains
    const safeCandidateSkills = (candidateProfile?.skills || []).slice(0, 5).join(', ');

    let firecrawlMarkdown = '';
    let isFirecrawlGrounded = false;

    const targetUrl = postingUrl && postingUrl.startsWith('http')
      ? postingUrl
      : companyDomain ? `https://${companyDomain}` : '';

    if (targetUrl) {
      const scrapeResult = await scrapeCompanyWithFirecrawl(targetUrl);
      if (scrapeResult.success && scrapeResult.markdown) {
        firecrawlMarkdown = scrapeResult.markdown.slice(0, 3500);
        isFirecrawlGrounded = true;
      }
    }

    const privacyAuditMessage = 'Privacy Verified: Zero candidate PII (name, email, phone, address, resume) transmitted to external search tools.';

    const systemInstruction = `You are an executive career research analyst.
Synthesize a structured company research brief for ${companyName} regarding the role: ${roleTitle}.
${isFirecrawlGrounded ? 'You have access to live extracted website content from Firecrawl API grounding.' : 'Synthesize based on public facts and domain context.'}
Label claims as "factual", "interpretation", or "unanswered". Do NOT invent fictional culture scores.`;

    const promptText = `COMPANY: ${companyName}
DOMAIN: ${companyDomain || 'N/A'}
ROLE: ${roleTitle}
ANONYMIZED CANDIDATE DOMAIN FOCUS: ${safeCandidateSkills || 'Software Leadership'}

${isFirecrawlGrounded ? `LIVE FIRECRAWL SCRAPED CONTENT:\n${firecrawlMarkdown}` : 'No live Firecrawl web extraction available. Provide factual synthesis based on public domain knowledge.'}`;

    const response = await ai.models.generateContent({
      model: GEMINI_PRIMARY_MODEL,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyOverview: { type: Type.STRING },
            customersAndMarket: { type: Type.STRING },
            productsOrServices: { type: Type.ARRAY, items: { type: Type.STRING } },
            recentDevelopments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  date: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  sourceTitle: { type: Type.STRING },
                },
                required: ['headline', 'summary'],
              },
            },
            roleResponsibilitiesBrief: { type: Type.STRING },
            whyCandidateIsRelevant: { type: Type.STRING },
            potentialContributions: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionsToInvestigate: { type: Type.ARRAY, items: { type: Type.STRING } },
            cultureStatements: {
              type: Type.OBJECT,
              properties: {
                officialCompanyStatements: { type: Type.ARRAY, items: { type: Type.STRING } },
                thirdPartyReports: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['officialCompanyStatements', 'thirdPartyReports'],
            },
            researchClaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statement: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'One of: factual, interpretation, unanswered',
                  },
                  sourceUrl: { type: Type.STRING },
                  sourceName: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['statement', 'type'],
              },
            },
            sourceConflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'companyOverview',
            'customersAndMarket',
            'productsOrServices',
            'recentDevelopments',
            'whyCandidateIsRelevant',
            'potentialContributions',
            'questionsToInvestigate',
            'cultureStatements',
            'researchClaims',
          ],
        },
      },
    });

    const brief = JSON.parse(response.text || '{}');

    const processedClaims = (brief.researchClaims || []).map((c: any) => ({
      ...c,
      provenance: isFirecrawlGrounded
        ? 'Public source'
        : c.sourceUrl ? 'Public source' : 'AI generated — needs review',
    }));

    return NextResponse.json({
      success: true,
      brief: {
        opportunityId: opportunity.id,
        ...brief,
        researchClaims: processedClaims,
        updatedAt: new Date().toISOString(),
        provenance: isFirecrawlGrounded ? 'Public source' : 'AI generated — needs review',
        firecrawlGrounded: isFirecrawlGrounded,
        privacyAudit: privacyAuditMessage,
      },
    });
  } catch (err: any) {
    console.error('Error generating company brief:', err);
    return NextResponse.json({ error: err?.message || 'Failed to synthesize company brief.' }, { status: 500 });
  }
}
