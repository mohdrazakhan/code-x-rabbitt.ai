import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb, getAdminApp } from '@/lib/firebaseAdmin';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const PlanSchema = z.object({
  title: z.string().default('Personalized Plan'),
  planItems: z.array(
    z.object({ day: z.number().int().positive(), task: z.string(), est_hours: z.number().positive().optional() })
  ),
});

async function getUid(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  console.log('Auth header present:', !!authHeader);
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('No Bearer token found');
    return null;
  }
  
  const token = authHeader.slice('Bearer '.length);
  console.log('Token length:', token.length);
  
  try {
    getAdminApp();
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    console.log('Token verified for UID:', decoded.uid);
    return decoded.uid;
  } catch (e) {
    console.error('Token verification failed:', e.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const uid = await getUid(request);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = PlanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const db = getAdminDb();
    const doc = {
      uid,
      title: parsed.data.title,
      planItems: parsed.data.planItems,
      progress: { completed: 0, total: parsed.data.planItems.length },
      createdAt: Date.now(),
    };
    const ref = await db.collection('learningPlans').add(doc);
    return NextResponse.json({ id: ref.id });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
