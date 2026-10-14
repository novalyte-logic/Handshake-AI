import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_PRIMARY_MODEL } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { opportunity, candidateProfile } = await req.json();

    if (!opportunity) {
      return NextResponse.json({ error: 'Missing opportunity data.' }, { status: 400 });
    }

    const systemInstruction = `You are an interview coach.
Generate interview preparation guidance grounded in the candidate's verified experience.
Label predicted questions as suggestions and identify missing details needed for STAR outlines instead of inventing them.`;

    const promptText = JSON.stringify({
      opportunity: {
        companyName: opportunity.companyName,
        roleTitle: opportunity.roleTitle,
        responsibilities: opportunity.responsibilities || [],
        requiredQualifications: opportunity.requiredQualifications || [],
      },
      candidate: {
        name: candidateProfile?.name,
        employment: candidateProfile?.employment || [],
        accomplishments: candidateProfile?.accomplishments || [],
        evidenceLibrary: candidateProfile?.evidenceLibrary || [],
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
            predictedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of: Behavioral, Technical / Domain, Role-Specific, Culture & Leadership',
                  },
                  candidateExample: { type: Type.STRING },
                  starOutline: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING },
                      missingDetailsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['situation', 'task', 'action', 'result'],
                  },
                },
                required: ['question', 'category', 'candidateExample', 'starOutline'],
              },
            },
            questionsToAskInterviewer: { type: Type.ARRAY, items: { type: Type.STRING } },
            gapExplanationsAndTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gap: { type: Type.STRING },
                  recommendedExplanation: { type: Type.STRING },
                  prepTask: { type: Type.STRING },
                },
                required: ['gap', 'recommendedExplanation', 'prepTask'],
              },
            },
            companyTopicsToDiscuss: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'predictedQuestions',
            'questionsToAskInterviewer',
            'gapExplanationsAndTasks',
            'companyTopicsToDiscuss',
          ],
        },
      },
    });

    const interviewPrep = JSON.parse(response.text || '{}');

    const processedQuestions = (interviewPrep.predictedQuestions || []).map((q: any) => ({
      ...q,
      provenance: 'AI generated — needs review',
    }));

    return NextResponse.json({
      success: true,
      interviewPrep: {
        opportunityId: opportunity.id,
        ...interviewPrep,
        predictedQuestions: processedQuestions,
        updatedAt: new Date().toISOString(),
        provenance: 'AI generated — needs review',
      },
    });
  } catch (err: any) {
    console.error('Error generating interview prep:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate interview prep.' }, { status: 500 });
  }
}
