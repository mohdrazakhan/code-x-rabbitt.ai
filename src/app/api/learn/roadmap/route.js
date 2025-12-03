import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const InputSchema = z.object({
  language: z.string(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner')
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

    const { language, skillLevel } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        roadmap: Array(7).fill(0).map((_, i) => ({
          day: i + 1,
          task: `Learn ${language} concepts - Day ${i + 1}`,
          est_hours: 1.5
        }))
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Create a 7-day learning roadmap for ${language} at ${skillLevel} level. 
    Return a JSON array of {day: number, task: string, est_hours: number}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    const roadmap = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json({ roadmap });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate roadmap', details: error.message },
      { status: 500 }
    );
  }
}