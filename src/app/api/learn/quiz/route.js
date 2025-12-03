import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const InputSchema = z.object({
  language: z.string(),
  topic: z.string().optional()
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

    const { language, topic } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        questions: [{
          question: 'What is the output of: console.log(2 + "2")?',
          options: ['4', '22', 'NaN', 'Error'],
          answer: 1,
          explanation: 'In JavaScript, the + operator with a string performs string concatenation.'
        }]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate a quiz question about ${language}${topic ? ` focusing on ${topic}` : ''}. 
    Return a JSON with: {question: string, options: string[], answer: number, explanation: string}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const quiz = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json({ questions: [quiz] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error.message },
      { status: 500 }
    );
  }
}