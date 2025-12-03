'use client'
import EditorClient from "@/components/cores/Editor/EditorClient";
// Dynamically import the EditorClient component with SSR disable

export default function EditorPage() {
  return (
    <div className="h-screen w-full bg-zinc-900">
      <EditorClient />
    </div>
  );
}