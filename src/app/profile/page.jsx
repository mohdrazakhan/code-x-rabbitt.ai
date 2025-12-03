"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, getDb, isFirebaseConfigured } from "@/lib/firebaseClient";
import { onAuthStateChanged, updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const auth = getFirebaseAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({ displayName: "", photoURL: "", bio: "", points: 0 });

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        return;
      }
      try {
        const db = getDb();
        if (!db) {
          setLoading(false);
          return;
        }
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.exists() ? snap.data() : {};
        setProfile({
          displayName: data.displayName || u.displayName || "",
          photoURL: data.photoURL || u.photoURL || "",
          bio: data.bio || "",
          points: data.points ?? 0,
        });
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    });
  }, [auth]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const db = getDb();
      const u = auth?.currentUser;
      if (!db || !u) throw new Error("Not signed in");
      if (isFirebaseConfigured) {
        await setDoc(
          doc(db, "users", u.uid),
          {
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            bio: profile.bio,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        await updateAuthProfile(u, {
          displayName: profile.displayName || undefined,
          photoURL: profile.photoURL || undefined,
        });
      }
    } catch (e) {
      setError(e.message || "Failed to save profile");
    }
  };

  if (loading) {
    return <main className="max-w-3xl mx-auto px-4 py-8">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p>Please <a href="/signin" className="text-blue-500">sign in</a> to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="avatar" className="w-14 h-14 rounded-full border border-neutral-700" />
        ) : (
          <div className="w-14 h-14 rounded-full border border-neutral-700 flex items-center justify-center bg-neutral-900">
            {(user.displayName || user.email || "").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.displayName || profile.displayName || user.email}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">UID: {user.uid}</p>
        </div>
        <div className="ml-auto text-sm bg-neutral-800 rounded px-3 py-1">Points: {profile.points}</div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <form onSubmit={saveProfile} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Display Name</label>
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Photo URL</label>
          <input
            type="url"
            value={profile.photoURL}
            onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 h-24"
          />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2">
          Save Profile
        </button>
      </form>
    </main>
  );
}
