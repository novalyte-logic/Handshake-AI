import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { textContent, filename } = await req.json();

    if (!textContent || typeof textContent !== 'string' || !textContent.trim()) {
      return NextResponse.json(
        { error: 'No text content provided. Please upload a file with readable text or paste your resume.' },
        { status: 400 }
      );
    }

    const systemInstruction = `You are a career data parsing specialist. 
Extract structured profile information and factual evidence claims from the candidate resume text.
Rules:
1. Extract exact, truthful facts from the provided text.
2. Do not invent any employment, metrics, degrees, or certifications that are not present in the text.
3. For the evidence library, extract distinct verifiable claims with supporting context and mark their source document as "${filename || 'Uploaded Resume'}".
4. Set evidence status to "imported/unreviewed".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: textContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            github: { type: Type.STRING },
            website: { type: Type.STRING },
            summary: { type: Type.STRING },
            employment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['company', 'role', 'highlights'],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  field: { type: Type.STRING },
                  graduationYear: { type: Type.STRING },
                },
                required: ['institution', 'degree'],
              },
            },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  link: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['name', 'description'],
              },
            },
            accomplishments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  metric: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['title', 'description'],
              },
            },
            preferences: {
              type: Type.OBJECT,
              properties: {
                targetRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                preferredLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
                workArrangement: { type: Type.ARRAY, items: { type: Type.STRING } },
                salaryExpectation: { type: Type.STRING },
                seniority: { type: Type.STRING },
                workAuthorization: { type: Type.STRING },
              },
            },
            evidenceClaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING },
                  supportingContext: { type: Type.STRING },
                },
                required: ['claim', 'supportingContext'],
              },
            },
          },
          required: ['name', 'employment', 'skills', 'evidenceClaims'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Error parsing profile with Gemini:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to parse resume text using AI.' },
      { status: 500 }
    );
  }
}
