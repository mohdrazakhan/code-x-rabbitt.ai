"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function HomeCta(){
  const auth = getFirebaseAuth();
  const [user, setUser] = useState(null);
  useEffect(()=>{
    if(!auth) return;
    return onAuthStateChanged(auth, setUser);
  },[auth]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/editor" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white shadow hover:brightness-110">Start Coding</Link>
      {!user && (
        <Link href="/login" className="px-5 py-2.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900">Login</Link>
      )}
      <Link href="/leaderboard" className="px-5 py-2.5 rounded-lg border">Leaderboard</Link>
    </div>
  );
}
