import { NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';

const InputSchema = z.object({
  language: z.string(),
  sourceCode: z.string(),
  stdin: z.string().optional().default("")
});

const languageMap = {
  python: 71, 'python3': 71,
  javascript: 63, node: 63,
  cpp: 54, 'c++': 54,
  java: 62,
};

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

    const { language, sourceCode, stdin } = parsed.data;
    const baseUrl = process.env.JUDGE0_API_URL;
    const langId = languageMap[language?.toLowerCase()] ?? null;

    console.log('Environment check:', {
      hasBaseUrl: !!baseUrl,
      hasApiKey: !!process.env.JUDGE0_API_KEY,
      language,
      langId
    });

    if (!baseUrl || !langId) {
      return NextResponse.json(
        { 
          error: 'Unsupported language or missing configuration',
          details: {
            hasBaseUrl: !!baseUrl,
            hasApiKey: !!process.env.JUDGE0_API_KEY,
            supportedLanguages: Object.keys(languageMap),
            requestedLanguage: language,
            langId
          }
        },
        { status: 400 }
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    };
    if (process.env.JUDGE0_API_KEY) {
      headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    }

    const submissionData = {
      source_code: sourceCode,
      language_id: langId,
      stdin: stdin || ''
    };
    
    console.log('Sending to Judge0:', {
      url: `${baseUrl}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,status,compile_output,time,memory`,
      data: submissionData,
      headers: Object.keys(headers)
    });

    const submission = await axios.post(
      `${baseUrl}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,status,compile_output,time,memory`,
      submissionData,
      { headers }
    );

    return NextResponse.json(submission.data);
  } catch (error) {
    console.error('Compile API Error:', error);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error response headers:', error.response?.headers);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to execute code',
        details: error.response?.data || 'No additional details',
        status: error.response?.status
      },
      { status: 500 }
    );
  }
}