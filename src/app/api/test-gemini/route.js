import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables',
        hasKey: false 
      }, { status: 500 });
    }

    // Test the API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = 'Say "Hello, Gemini API is working!" in JSON format with a key "message".';
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ 
      success: true,
      hasKey: true,
      keyLength: apiKey.length,
      response: text,
      message: 'Gemini API is working correctly!'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      hasKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0
    }, { status: 500 });
  }
}
