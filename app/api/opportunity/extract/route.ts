import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { rawInput, inputType, url } = await req.json();

    let textToAnalyze = rawInput;
    let isLiveChecked = false;
    let postingUrl = url || '';

    // If inputType === 'url' and Firecrawl API key is present, attempt live fetch
    if (inputType === 'url' && url) {
      postingUrl = url;
      if (process.env.FIRECRAWL_API_KEY) {
        try {
          const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            },
            body: JSON.stringify({ url, formats: ['markdown'] }),
          });
          if (fcRes.ok) {
            const fcData = await fcRes.json();
            if (fcData?.data?.markdown) {
              textToAnalyze = fcData.data.markdown;
              isLiveChecked = true;
            }
          }
        } catch (fcErr) {
          console.warn('Firecrawl fetch failed, using URL context or fallback', fcErr);
        }
      }
    }

    if (!textToAnalyze || typeof textToAnalyze !== 'string' || !textToAnalyze.trim()) {
      return NextResponse.json(
        { error: 'No job description text provided or accessible. Please paste the job description text.' },
        { status: 400 }
      );
    }

    const systemInstruction = `You are a recruitment intelligence analyst.
Extract structured fields from the job posting text.
CRITICAL INSTRUCTIONS:
1. If a field like salary, deadline, or employment type is not explicitly stated, return "Not disclosed".
2. Separate explicit eligibility constraints (e.g. "Must be US Citizen", "Must reside in SF") from general required skills and preferred qualifications.
3. Infer the official company domain (e.g., anthropic.com) based on the company name if possible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: textToAnalyze,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            companyDomain: { type: Type.STRING },
            roleTitle: { type: Type.STRING },
            location: { type: Type.STRING },
            workplaceArrangement: {
              type: Type.STRING,
              description: 'One of: Remote, Hybrid, Onsite, or Not disclosed',
            },
            employmentType: {
              type: Type.STRING,
              description: 'One of: Full-time, Contract, Part-time, or Not disclosed',
            },
            salary: { type: Type.STRING },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            requiredQualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            preferredQualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            explicitEligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
            deadline: { type: Type.STRING },
            applicationUrl: { type: Type.STRING },
          },
          required: [
            'companyName',
            'roleTitle',
            'workplaceArrangement',
            'employmentType',
            'salary',
            'responsibilities',
            'requiredQualifications',
          ],
        },
      },
    });

    const extracted = JSON.parse(response.text || '{}');

    return NextResponse.json({
      success: true,
      opportunity: {
        ...extracted,
        postingUrl: postingUrl || extracted.applicationUrl || `https://${extracted.companyDomain || 'company.com'}/careers`,
        isLiveChecked,
        dateChecked: new Date().toISOString().split('T')[0],
        rawJobDescription: textToAnalyze.slice(0, 4000),
      },
    });
  } catch (err: any) {
    console.error('Error extracting opportunity:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to extract opportunity details.' },
      { status: 500 }
    );
  }
}
