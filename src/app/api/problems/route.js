import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const difficulty = searchParams.get('difficulty');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  // Try Firestore first
  try {
    const db = getAdminDb();
    let query = db.collection('problems');
    if (tag) query = query.where('tags', 'array-contains', tag);
    if (difficulty) query = query.where('difficulty', '==', difficulty);
    const snap = await query.limit(pageSize).get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items: data, page, pageSize });
  } catch (e) {
    // Fallback to local JSON
    try {
      const filePath = path.join(process.cwd(), 'public', 'problems.json');
      const raw = await fs.readFile(filePath, 'utf8');
      let items = JSON.parse(raw);
      if (tag) items = items.filter((p) => (p.tags || []).includes(tag));
      if (difficulty) items = items.filter((p) => p.difficulty === difficulty);
      const start = (page - 1) * pageSize;
      const paged = items.slice(start, start + pageSize);
      return NextResponse.json({ items: paged, page, pageSize });
    } catch (err) {
      return NextResponse.json({ items: [], page, pageSize });
    }
  }
}
