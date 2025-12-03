import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('users').orderBy('points', 'desc').limit(50).get();
    
    if (snap.empty) {
      console.log('No users found in Firestore, returning mock data');
      return getMockLeaderboard();
    }
    
    const items = snap.docs.map((d, idx) => ({ 
      rank: idx + 1, 
      uid: d.id, 
      displayName: d.data().displayName || d.data().email?.split('@')[0] || `User ${d.id.slice(0, 6)}`,
      email: d.data().email,
      points: d.data().points || 0,
      problemsSolved: d.data().problemsSolved || 0,
      createdAt: d.data().createdAt
    }));
    
    console.log(`Loaded ${items.length} users from Firestore`);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('Leaderboard error, using mock data:', e.message);
    
    // Try to get current user from query param to show them in mock data
    const url = new URL(request.url);
    const currentUser = url.searchParams.get('currentUser');
    
    return getMockLeaderboard(currentUser);
  }
}

function getMockLeaderboard(currentUserName = null) {
  const mockUsers = [
    { rank: 1, uid: 'demo1', displayName: 'Ada Lovelace', email: 'ada@example.com', points: 1250, problemsSolved: 45 },
    { rank: 2, uid: 'demo2', displayName: 'Alan Turing', email: 'alan@example.com', points: 1100, problemsSolved: 38 },
    { rank: 3, uid: 'demo3', displayName: 'Grace Hopper', email: 'grace@example.com', points: 980, problemsSolved: 35 },
    { rank: 4, uid: 'demo4', displayName: 'Dennis Ritchie', email: 'dennis@example.com', points: 875, problemsSolved: 32 },
    { rank: 5, uid: 'demo5', displayName: 'Linus Torvalds', email: 'linus@example.com', points: 820, problemsSolved: 29 },
    { rank: 6, uid: 'demo6', displayName: 'Ken Thompson', email: 'ken@example.com', points: 760, problemsSolved: 27 },
    { rank: 7, uid: 'demo7', displayName: 'Bjarne Stroustrup', email: 'bjarne@example.com', points: 695, problemsSolved: 24 },
    { rank: 8, uid: 'demo8', displayName: 'Guido van Rossum', email: 'guido@example.com', points: 630, problemsSolved: 22 },
    { rank: 9, uid: 'demo9', displayName: 'James Gosling', email: 'james@example.com', points: 580, problemsSolved: 20 },
    { rank: 10, uid: 'demo10', displayName: 'Tim Berners-Lee', email: 'tim@example.com', points: 545, problemsSolved: 18 },
  ];
  
  // Add current user if provided
  if (currentUserName) {
    mockUsers.unshift({
      rank: 1,
      uid: 'current',
      displayName: currentUserName,
      email: 'you@example.com',
      points: 1500,
      problemsSolved: 50
    });
    
    // Re-rank everyone
    mockUsers.forEach((user, idx) => {
      user.rank = idx + 1;
    });
  }
  
  return NextResponse.json({ items: mockUsers });
}
