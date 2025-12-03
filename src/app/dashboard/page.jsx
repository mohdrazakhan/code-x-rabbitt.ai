"use client";
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function DashboardPage(){
  const auth = getFirebaseAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!auth){ setLoading(false); return; }
    return onAuthStateChanged(auth, (u)=>{ setUser(u); setLoading(false); });
  },[auth]);

  if(loading) return <main className="max-w-4xl mx-auto px-4 py-8">Loading…</main>;
  if(!user) return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Please sign in to access your dashboard.</p>
      <Link href="/login" className="px-3 py-1.5 rounded bg-blue-600 text-white">Go to Login</Link>
    </main>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #fff 1.5px, transparent 1.5px), radial-gradient(circle at 40% 70%, #fff 1px, transparent 1px)'
        }} />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Welcome, {user.displayName || user.email}</h1>
          <p className="text-white/80 text-sm mt-1">UID: {user.uid}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <section className="group rounded-2xl border p-5 transition hover:shadow-lg hover:border-blue-500/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Quick Actions</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Get started</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/editor" className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:brightness-110">Open Editor</Link>
            <Link href="/problems" className="px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900">Browse Problems</Link>
            <Link href="/leaderboard" className="px-4 py-2 rounded-lg border">Leaderboard</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 animate-float">
            {["AI tips","Fast runs","Sandbox"].map((t,i)=>(
              <div key={i} className="rounded-lg border p-3 text-xs text-gray-600 dark:text-gray-300">
                {t}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border p-5 transition hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your Roadmaps</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Coming alive</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Accepted plans will appear here after saving from the Editor.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="rounded-lg border p-3">
                <div className="text-sm font-medium">Day {i+1}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Practice + review</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
