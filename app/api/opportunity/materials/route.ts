import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_PRIMARY_MODEL } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { opportunity, candidateProfile } = await req.json();

    if (!opportunity || !candidateProfile) {
      return NextResponse.json({ error: 'Missing opportunity or candidate profile.' }, { status: 400 });
    }

    const confirmedClaims = (candidateProfile.evidenceLibrary || [])
      .filter((e: any) => e.status === 'user-confirmed')
      .map((e: any) => e.claim);

    const systemInstruction = `You are a career document strategist.
Generate tailored application materials strictly grounded in candidate facts.

ANTI-HALLUCINATION DISCIPLINE:
1. Do NOT invent revenue numbers, sales quotas, team sizes, certifications, or tool names.
2. Every major change must be explained and linked to a confirmed evidence claim.
3. If an ideal detail is missing, add it to "statementsRequiringConfirmation".
4. Count and list all confirmed claims used and statements requiring confirmation for the Review Panel.`;

    const promptText = JSON.stringify({
      opportunity: {
        companyName: opportunity.companyName,
        roleTitle: opportunity.roleTitle,
        responsibilities: opportunity.responsibilities || [],
        requiredQualifications: opportunity.requiredQualifications || [],
        preferredQualifications: opportunity.preferredQualifications || [],
      },
      candidate: {
        name: candidateProfile.name,
        email: candidateProfile.email,
        summary: candidateProfile.summary,
        employment: candidateProfile.employment || [],
        confirmedClaims,
      },
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
            shortSummary: { type: Type.STRING },
            tailoredResume: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                employment: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      company: { type: Type.STRING },
                      title: { type: Type.STRING },
                      dates: { type: Type.STRING },
                      highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rationale: { type: Type.STRING },
                    },
                    required: ['company', 'title', 'highlights', 'rationale'],
                  },
                },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      degree: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      year: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['summary', 'employment', 'skills', 'education'],
            },
            coverLetter: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                salutation: { type: Type.STRING },
                bodyParagraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
                closing: { type: Type.STRING },
                supportingEvidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['subject', 'salutation', 'bodyParagraphs', 'closing'],
            },
            applicationQuestionResponses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  response: { type: Type.STRING },
                  supportedByClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['question', 'response'],
              },
            },
            majorChangesExplanation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  change: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  evidenceClaim: { type: Type.STRING },
                },
                required: ['section', 'change', 'reason', 'evidenceClaim'],
              },
            },
            statementsRequiringConfirmation: { type: Type.ARRAY, items: { type: Type.STRING } },
            confirmedStatementsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'shortSummary',
            'tailoredResume',
            'coverLetter',
            'applicationQuestionResponses',
            'majorChangesExplanation',
            'statementsRequiringConfirmation',
            'confirmedStatementsUsed',
          ],
        },
      },
    });

    const materials = JSON.parse(response.text || '{}');
    const timestamp = new Date().toISOString();

    const reviewPanel = {
      confirmedClaimsCount: materials.confirmedStatementsUsed?.length || 0,
      userProvidedStatementsCount: 1,
      statementsRequiringConfirmationCount: materials.statementsRequiringConfirmation?.length || 0,
      blockedUnsupportedStatementsCount: 0,
      lastReviewedTimestamp: timestamp,
      confirmedStatementsUsed: materials.confirmedStatementsUsed || [],
      userProvidedStatementsUsed: [candidateProfile.summary || 'User Master Summary'],
      statementsRequiringConfirmation: materials.statementsRequiringConfirmation || [],
      blockedUnsupportedStatements: [],
    };

    return NextResponse.json({
      success: true,
      materials: {
        opportunityId: opportunity.id,
        ...materials,
        reviewPanel,
        version: 1,
        isApproved: false,
        updatedAt: timestamp,
        provenance: 'AI generated — needs review',
      },
    });
  } catch (err: any) {
    console.error('Error generating application materials:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate application materials.' }, { status: 500 });
  }
}
