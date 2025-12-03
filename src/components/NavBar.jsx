"use client";
import Link from 'next/link';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '@/lib/firebaseClient';
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, [auth]);

  async function handleSignIn() {
    if (!auth || !isFirebaseConfigured) {
      alert('Sign-in disabled. Configure NEXT_PUBLIC_FIREBASE_* in .env.local');
      return;
    }
    const provider = getGoogleProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) router.push('/dashboard');
    } catch (e) {
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error('Login error:', e);
        alert(e?.message || 'Login failed');
      }
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || 'CODE-X'}</Link>
          <nav className="hidden sm:flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/editor">Editor</Link>
            <Link href="/problems">Problems</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">{user.displayName || user.email}</span>
              <button onClick={handleSignOut} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm">Sign out</button>
            </>
          ) : (
            <button onClick={handleSignIn} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm" disabled={!isFirebaseConfigured}>
              {isFirebaseConfigured ? 'Sign in' : 'Sign in (configure env)'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
