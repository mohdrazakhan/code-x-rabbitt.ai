import { NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminDb, getAdminApp } from '@/lib/firebaseAdmin';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const InputSchema = z.object({
  language: z.string(),
  sourceCode: z.string(),
  stdin: z.string().optional().default(""),
  problemId: z.string().optional(),
  problem: z
    .object({ 
      id: z.string().optional(), 
      title: z.string().optional(), 
      statement: z.string().optional(), 
      examples: z.any().optional(), 
      tags: z.any().optional() 
    })
    .optional()
    .nullable(),
});

const languageMap = {
  python: 71, // Python (3.8.1)
  'python3': 71,
  javascript: 63, // JavaScript (Node.js 12.14.0)
  node: 63,
  cpp: 54, // C++ (GCC 9.2.0)
  'c++': 54,
  java: 62, // Java (OpenJDK 13.0.1)
};

async function runJudge0({ language, sourceCode, stdin }) {
  const baseUrl = process.env.JUDGE0_API_URL;
  const langId = languageMap[language?.toLowerCase?.()] ?? null;
  if (!baseUrl || !langId) {
    return {
      mocked: true,
      status: { id: 3, description: 'Accepted' },
      stdout: 'MOCK_OUTPUT',
      time: '0.01',
      memory: 1234,
      stderr: null,
      compile_output: null,
    };
  }
  try {
    const headers = {};
    if (process.env.JUDGE0_API_KEY) {
      headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    }

    const submission = await axios.post(
      `${baseUrl}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,status,compile_output,time,memory`,
      {
        source_code: sourceCode,
        language_id: langId,
        stdin: stdin || '',
      },
      { headers }
    );
    return submission.data;
  } catch (err) {
    return {
      status: { id: -1, description: 'Judge0 Error' },
      stderr: err?.message || 'Unknown error',
      time: null,
      memory: null,
    };
  }
}

const expectedJsonDesc = `Return JSON with keys: summary (string), strengths (string[]), weaknesses (string[]), suggested_fixes (array of {line_hint?: number, fix_snippet?: string, description: string}), roadmap (array of EXACTLY 7 items with {day: number (1-7), task: string, est_hours: number} representing a 7-day learning path), recommendedProblems (array of {id: string, title: string, difficulty: string}).`;

async function runGemini({ problem, sourceCode, judgeResult, language }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: 'Strong approach. Consider improving edge-case handling.',
      strengths: ['Clear variable names', 'Time complexity is optimal'],
      weaknesses: ['Missing input validation'],
      suggested_fixes: [
        { description: 'Check for empty input before processing.' },
      ],
      roadmap: [
        { day: 1, task: 'Review hash maps basics', est_hours: 1 },
        { day: 2, task: 'Solve 2-3 easy array problems', est_hours: 1.5 },
        { day: 3, task: 'Refactor to add tests', est_hours: 1 },
        { day: 4, task: 'Solve 1 medium problem', est_hours: 1.5 },
        { day: 5, task: 'Read article on edge cases', est_hours: 1 },
        { day: 6, task: 'Timed practice session', est_hours: 1 },
        { day: 7, task: 'Review and reflect', est_hours: 0.5 },
      ],
      recommendedProblems: [
        { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert coding coach. Analyze the user's submission.\nLanguage: ${language}\nProblem: ${problem?.title || problem?.id || 'N/A'}\nStatement: ${problem?.statement || 'N/A'}\nSource Code:\n\n${sourceCode}\n\nJudge Output:\n${JSON.stringify(judgeResult, null, 2)}\n\n${expectedJsonDesc}\nRespond with ONLY JSON.`;
    
    console.log('Calling Gemini API with model: gemini-2.5-flash');
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    console.log('Gemini API response received, length:', text.length);
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn('No JSON found in Gemini response');
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    console.log('Successfully parsed Gemini response');
    return parsed;
  } catch (e) {
    console.error('Gemini API error:', e?.message, e?.stack);
    return {
      summary: 'AI analysis unavailable. Basic feedback provided.',
      strengths: ['Code structure looks good'],
      weaknesses: ['Enable Gemini API for detailed analysis'],
      suggested_fixes: [
        { description: 'Set GEMINI_API_KEY environment variable for AI feedback.' },
      ],
      roadmap: [
        { day: 1, task: 'Practice basic coding patterns', est_hours: 1 },
        { day: 2, task: 'Solve easy problems', est_hours: 1.5 },
        { day: 3, task: 'Review solutions', est_hours: 1 },
        { day: 4, task: 'Learn advanced patterns', est_hours: 2 },
        { day: 5, task: 'Solve medium problems', est_hours: 1.5 },
        { day: 6, task: 'Timed practice', est_hours: 1 },
        { day: 7, task: 'Review and reflect', est_hours: 1 },
      ],
      recommendedProblems: [
        { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
      ],
    };
  }
}

async function getUidFromAuthHeader(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);
  try {
    getAdminApp();
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }
    const { language, sourceCode, stdin, problemId, problem } = parsed.data;

    const judgeResult = await runJudge0({ language, sourceCode, stdin });
    const aiReport = await runGemini({ problem, sourceCode, judgeResult, language });

    // Optional: save submission if authenticated and Firestore configured
    try {
      const uid = await getUidFromAuthHeader(request);
      if (uid) {
        const db = getAdminDb();
        const submission = {
          uid,
          pid: problem?.id || problemId || null,
          language,
          sourceCode,
          judge0Result: judgeResult,
          aiReport,
          createdAt: Date.now(),
        };
        await db.collection('submissions').add(submission);
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to save submission:', e?.message);
    }

    return NextResponse.json({ judgeResult, aiReport });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
