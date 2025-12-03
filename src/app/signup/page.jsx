"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  getDb,
} from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const db = getDb();
      if (!auth || !db || !isFirebaseConfigured()) {
        throw new Error("Firebase not configured");
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      if (displayName || photoURL) {
        await updateProfile(user, { displayName: displayName || undefined, photoURL: photoURL || undefined });
      }
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email?.split("@")[0],
        photoURL: photoURL || "",
        bio: "",
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border border-neutral-800 rounded-xl p-6 bg-neutral-950">
        <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
        {!isFirebaseConfigured() && (
          <p className="text-sm text-yellow-400 mb-3">
            Firebase is not configured; sign-up will not work.
          </p>
        )}
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Photo URL (optional)</label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              placeholder="https://example.com/me.jpg"
            />
          </div>
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
            {loading ? "Creating…" : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-400">
          Already have an account? <a href="/signin" className="text-blue-400">Sign in</a>
        </p>
      </div>
    </div>
  );
}
