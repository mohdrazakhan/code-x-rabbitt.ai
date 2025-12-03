"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) router.replace("/dashboard");
    });
    // Handle redirect result if coming back from Google redirect
    getRedirectResult(auth).catch(() => {});
    return () => unsub();
  }, [router]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth || !isFirebaseConfigured()) {
        throw new Error("Firebase not configured");
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const auth = getFirebaseAuth();
    if (!auth || !isFirebaseConfigured()) {
      setError("Firebase not configured");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.replace("/dashboard");
    } catch (e) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (err) {
        setError(err.message || "Google sign-in failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border border-neutral-800 rounded-xl p-6 bg-neutral-950">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        {!isFirebaseConfigured() && (
          <p className="text-sm text-yellow-400 mb-3">
            Firebase is not configured; sign-in will not work.
          </p>
        )}
        {error && (
          <div className="text-red-400 text-sm mb-3">{error}</div>
        )}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded py-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogle}
            className="w-full bg-neutral-800 hover:bg-neutral-700 rounded py-2"
          >
            Continue with Google
          </button>
        </div>
        <p className="mt-4 text-sm text-neutral-400">
          Don’t have an account? <a href="/signup" className="text-blue-400">Sign up</a>
        </p>
      </div>
    </div>
  );
}
