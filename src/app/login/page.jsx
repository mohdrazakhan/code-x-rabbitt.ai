"use client";
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '@/lib/firebaseClient';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage(){
  const auth = useMemo(()=>getFirebaseAuth(),[]);
  const router = useRouter();

  useEffect(()=>{
    // If a redirect completed, route to dashboard
    async function checkRedirect(){
      if(!auth) return;
      try {
        const result = await getRedirectResult(auth);
        if(result?.user) router.push('/dashboard');
      } catch {}
    }
    checkRedirect();
  },[auth, router]);

  async function handleGoogle(){
    if (!auth || !isFirebaseConfigured){
      alert('Sign-in is disabled. Configure NEXT_PUBLIC_FIREBASE_* in .env.local');
      return;
    }
    const provider = getGoogleProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) router.push('/dashboard');
    } catch (e) {
      // Fallback to redirect if popup blocked or cancelled
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error('Login error:', e);
        alert(e?.message || 'Login failed');
      }
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Sign in to access your dashboard, editor, and saved plans.</p>
      <button onClick={handleGoogle} className="w-full px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={!isFirebaseConfigured}>
        {isFirebaseConfigured ? 'Continue with Google' : 'Configure Firebase to enable login'}
      </button>
      <div className="mt-6 text-sm">
        <Link href="/">Back to home</Link>
      </div>
    </main>
  );
}
