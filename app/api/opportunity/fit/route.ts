import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_REASONING_MODEL, GEMINI_PRIMARY_MODEL } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { opportunity, candidateProfile } = await req.json();

    if (!opportunity || !candidateProfile) {
      return NextResponse.json({ error: 'Missing opportunity or candidate profile.' }, { status: 400 });
    }

    const systemInstruction = `You are an executive evidence analyst evaluating candidate fit.

FIT SCORE WEIGHTED RUBRIC:
1. Required qualifications: 60% total weight
2. Preferred qualifications: 20% total weight
3. Responsibilities and transferable experience: 15% total weight
4. Explicit eligibility constraints: 5% total weight

CRITICAL DISCIPLINE:
- Unknown information must remain "unknown" (0 score contribution, but NOT automatically a gap).
- Calculate evidenceCoverageScore as the sum of score contributions across all categories (0-100%).
- If an explicit eligibility constraint (e.g. location, visa, mandatory degree) fails, set isConstraintBlocked to true and provide an independent explanation.
- Category Recommendation must be one of: "Apply", "Consider applying", "Resolve a key question first", "Low priority".`;

    const promptText = JSON.stringify({
      opportunity: {
        roleTitle: opportunity.roleTitle,
        companyName: opportunity.companyName,
        requiredQualifications: opportunity.requiredQualifications || [],
        preferredQualifications: opportunity.preferredQualifications || [],
        explicitEligibility: opportunity.explicitEligibility || [],
        responsibilities: opportunity.responsibilities || [],
      },
      candidate: {
        name: candidateProfile.name,
        summary: candidateProfile.summary,
        employment: candidateProfile.employment || [],
        skills: candidateProfile.skills || [],
        accomplishments: candidateProfile.accomplishments || [],
        evidenceLibrary: candidateProfile.evidenceLibrary || [],
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
            categoryRecommendation: {
              type: Type.STRING,
              description: 'One of: Apply, Consider applying, Resolve a key question first, Low priority',
            },
            evidenceCoverageScore: { type: Type.INTEGER },
            weightedRubricBreakdown: {
              type: Type.OBJECT,
              properties: {
                requiredScore: { type: Type.NUMBER },
                preferredScore: { type: Type.NUMBER },
                responsibilitiesScore: { type: Type.NUMBER },
                constraintsScore: { type: Type.NUMBER },
                totalScore: { type: Type.NUMBER },
                isConstraintBlocked: { type: Type.BOOLEAN },
                blockedConstraintExplanation: { type: Type.STRING },
              },
              required: [
                'requiredScore',
                'preferredScore',
                'responsibilitiesScore',
                'constraintsScore',
                'totalScore',
                'isConstraintBlocked',
              ],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            transferableExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
            unansweredQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            adjacentRoleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            requirementsTable: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobRequirement: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of: Required, Preferred, Responsibility, Constraint',
                  },
                  weight: { type: Type.NUMBER },
                  candidateEvidence: { type: Type.STRING },
                  assessment: {
                    type: Type.STRING,
                    description: 'One of: strong match, partial match, gap, unknown',
                  },
                  explanation: { type: Type.STRING },
                  sourceEvidence: { type: Type.STRING },
                  scoreContribution: { type: Type.NUMBER },
                  suggestedNextAction: { type: Type.STRING },
                },
                required: [
                  'jobRequirement',
                  'category',
                  'weight',
                  'candidateEvidence',
                  'assessment',
                  'explanation',
                  'scoreContribution',
                  'suggestedNextAction',
                ],
              },
            },
          },
          required: [
            'categoryRecommendation',
            'evidenceCoverageScore',
            'weightedRubricBreakdown',
            'strengths',
            'gaps',
            'requirementsTable',
          ],
        },
      },
    });

    const fitData = JSON.parse(response.text || '{}');

    return NextResponse.json({
      success: true,
      fitAssessment: {
        opportunityId: opportunity.id,
        status: 'Assessed',
        ...fitData,
        assessedAt: new Date().toISOString(),
        candidateProfileTimestamp: candidateProfile.updatedAt || new Date().toISOString(),
        provenance: 'AI generated — needs review',
      },
    });
  } catch (err: any) {
    console.error('Error in fit assessment API route:', err);
    return NextResponse.json({ error: err?.message || 'Failed to compute fit assessment.' }, { status: 500 });
  }
}
