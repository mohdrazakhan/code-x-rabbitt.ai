import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const InputSchema = z.object({
  language: z.string(),
  sourceCode: z.string(),
  problem: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    statement: z.string().optional(),
  }).optional()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { language, sourceCode, problem } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        summary: 'Enable Gemini API for detailed tips',
        strengths: ['Code structure looks good'],
        weaknesses: ['Enable Gemini API for detailed analysis'],
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `As a coding coach, provide tips for this ${language} code:\n\n${sourceCode}\n\nProblem: ${problem?.title || 'N/A'}\n\nProvide a JSON response with: {summary: string, strengths: string[], weaknesses: string[], suggested_fixes: {description: string}[]}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const tips = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json(tips);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate tips', details: error.message },
      { status: 500 }
    );
  }
}