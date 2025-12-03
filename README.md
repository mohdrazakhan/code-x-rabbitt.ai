## CODE-X — AI-powered personalized coding coach

This is the MVP for CODE-X: a Next.js + Firebase app that lets students practice coding, run code safely via Judge0, and get AI-generated feedback and personalized roadmaps.

Features in this MVP
- Authentication: Google sign-in (client-only)
- Editor: Monaco editor with language picker (Python/JS/C++/Java)
- Run: Serverless API to call Judge0 (or mock if no keys)
- AI Coach: Serverless call to Gemini (or mock if no key)
- Problems: Basic listing backed by Firestore (if configured) or local JSON
- Leaderboard: Firestore-backed (mocked if Firestore not configured)

## Quick start (local)

1) Install deps
```bash
npm install
```

2) Configure env vars: copy `.env.example` to `.env.local` and fill values.

Minimum for local dev (with mocks):
- No keys required. The app will return mocked Judge0 results and AI feedback.

To enable real services:
- Judge0: set `JUDGE0_API_URL` and `JUDGE0_API_KEY` (RapidAPI or self-hosted endpoint)
- Gemini: set `GEMINI_API_KEY`
- Firebase Admin: set `FIREBASE_SERVICE_ACCOUNT_JSON` or the individual admin fields
- Firebase Client: set `NEXT_PUBLIC_FIREBASE_...` values

3) Run dev server
```bash
npm run dev
```

Open http://localhost:3000

Pages
- `/` Landing
- `/editor` Monaco editor + run + AI Coach
- `/problems` Problems browser
- `/leaderboard` Leaderboard
- `/profile` Profile placeholder

## Environment variables
See `.env.example` for all variables. Recommended:
- `NEXT_PUBLIC_FIREBASE_*`: Firebase web config
- `FIREBASE_SERVICE_ACCOUNT_JSON`: JSON string or base64 of service account
- `JUDGE0_API_URL`, `JUDGE0_API_KEY`
- `GEMINI_API_KEY`

Security notes
- Client never sees server keys. Judge0 and AI calls happen in `/api/*` routes.
- Submissions/plans are saved only when a valid Firebase ID token (Authorization: Bearer) is present.

## Deploy to Vercel
1) Push to GitHub and import repo in Vercel.
2) Add env vars in Vercel Project Settings → Environment Variables.
3) Redeploy. Serverless API routes will pick up keys.

## Roadmap
- Save accepted plans in Firestore and show in Profile
- Add progress tracking and points updates
- Admin content tools for problem curation
