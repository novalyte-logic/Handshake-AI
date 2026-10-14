import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_PRIMARY_MODEL } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { opportunity, candidateProfile } = await req.json();

    if (!opportunity) {
      return NextResponse.json({ error: 'Missing opportunity data.' }, { status: 400 });
    }

    const companyName = opportunity.companyName || 'Target Company';
    const companyDomain = opportunity.companyDomain || '';
    const hasHunter = Boolean(process.env.HUNTER_API_KEY && process.env.HUNTER_API_KEY.trim().length > 0);

    let hunterEmailMap: Record<string, { email: string; verification: string; confidence: number }> = {};

    if (hasHunter && companyDomain && companyDomain !== 'example.com') {
      try {
        const hunterRes = await fetch(
          `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(companyDomain)}&api_key=${process.env.HUNTER_API_KEY}`
        );
        if (hunterRes.ok) {
          const hunterData = await hunterRes.json();
          if (hunterData?.data?.emails?.length) {
            hunterData.data.emails.forEach((e: any) => {
              const fullName = `${e.first_name || ''} ${e.last_name || ''}`.trim().toLowerCase();
              if (fullName) {
                hunterEmailMap[fullName] = {
                  email: e.value,
                  verification: e.confidence > 80 ? 'Deliverable' : 'Risky',
                  confidence: e.confidence || 70,
                };
              }
            });
          }
        }
      } catch (hErr) {
        console.warn('Hunter API domain search failed:', hErr);
      }
    }

    const systemInstruction = `You are a professional talent researcher and outreach strategist.
Identify contacts and draft personalized outreach.

CRITICAL DISCIPLINE:
1. Do NOT fabricate email addresses. If no verified email provider response exists or Hunter is unavailable, set email to empty string "".
2. Relationship status MUST ONLY be one of:
   - "Confirmed on the job posting"
   - "Confirmed recruiting contact"
   - "Possible department contact"
   - "Possible recruiting contact"
   - "Relevance unknown"
   - "Demo contact"
3. Do NOT label a contact as "Confirmed on the job posting" unless the job description explicitly names them.
4. If no contact can be sourced, return empty contacts array.
5. For drafts, connect role requirements to candidate evidence claims. Do NOT fabricate candidate experience.`;

    const promptText = JSON.stringify({
      companyName,
      companyDomain,
      roleTitle: opportunity.roleTitle,
      rawJobDescription: opportunity.rawJobDescription || '',
      candidate: {
        name: candidateProfile?.name || 'Candidate',
        summary: candidateProfile?.summary || '',
        evidenceLibrary: candidateProfile?.evidenceLibrary || [],
      },
      hunterConfigured: hasHunter,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_PRIMARY_MODEL,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  currentTitle: { type: Type.STRING },
                  company: { type: Type.STRING },
                  publicSourceUrl: { type: Type.STRING },
                  evidenceWorksAtCompany: { type: Type.STRING },
                  evidenceRelevantToOpening: { type: Type.STRING },
                  relationshipStatus: {
                    type: Type.STRING,
                    description: 'One of: Confirmed on the job posting, Confirmed recruiting contact, Possible department contact, Possible recruiting contact, Relevance unknown',
                  },
                },
                required: ['id', 'name', 'currentTitle', 'company', 'relationshipStatus'],
              },
            },
            drafts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'One of: Hiring-manager introduction, Recruiter introduction, LinkedIn message, Application follow-up, Interview thank-you',
                  },
                  recipientName: { type: Type.STRING },
                  recipientTitle: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING },
                  supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  companyDetailUsed: { type: Type.STRING },
                  candidateAccomplishmentUsed: { type: Type.STRING },
                },
                required: [
                  'id',
                  'type',
                  'recipientName',
                  'recipientTitle',
                  'subject',
                  'body',
                  'supportingEvidence',
                  'companyDetailUsed',
                  'candidateAccomplishmentUsed',
                ],
              },
            },
          },
          required: ['contacts', 'drafts'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');

    // Attach Hunter results or mark as Unavailable
    const processedContacts = (result.contacts || []).map((c: any) => {
      const hunterMatch = hunterEmailMap[c.name.toLowerCase()];
      if (hunterMatch) {
        return {
          ...c,
          email: hunterMatch.email,
          emailDiscoveryProvider: 'Hunter API',
          emailDiscoveryConfidence: hunterMatch.confidence,
          emailVerificationStatus: hunterMatch.verification,
          emailVerificationDate: new Date().toISOString().split('T')[0],
          dateChecked: new Date().toISOString().split('T')[0],
          provenance: 'Provider verified',
        };
      }
      return {
        ...c,
        email: '',
        emailDiscoveryProvider: hasHunter ? 'Hunter API (No Match)' : 'None (Hunter Not Configured)',
        emailVerificationStatus: hasHunter ? 'Unverified' : 'Unavailable',
        dateChecked: new Date().toISOString().split('T')[0],
        provenance: 'Public source',
      };
    });

    const processedDrafts = (result.drafts || []).map((d: any) => ({
      ...d,
      status: 'Needs review',
      provenance: 'AI generated — needs review',
    }));

    return NextResponse.json({
      success: true,
      contactsAndOutreach: {
        opportunityId: opportunity.id,
        contacts: processedContacts,
        drafts: processedDrafts,
        updatedAt: new Date().toISOString(),
        provenance: processedContacts.length > 0 ? 'Public source' : 'AI generated — needs review',
      },
    });
  } catch (err: any) {
    console.error('Error generating contacts and outreach:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate contacts and outreach.' }, { status: 500 });
  }
}
