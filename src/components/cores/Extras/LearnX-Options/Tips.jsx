"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/apiService";

export default function Tips({ language, sourceCode }) {
  const [tips, setTips] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTips = async () => {
      if (!sourceCode || sourceCode.trim().length < 10) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getTips({
          language,
          sourceCode,
          problem: {}
        });
        setTips(result);
      } catch (err) {
        console.error("Failed to fetch tips:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTips, 1000);
    return () => clearTimeout(debounceTimer);
  }, [language, sourceCode]);

  return (
    <div className="flex-1 overflow-auto p-4">
      {isLoading ? (
        <p className="text-zinc-500 text-sm text-center py-8">
          Analyzing your code...
        </p>
      ) : error ? (
        <p className="text-red-400 text-sm text-center py-8">
          Error: {error}
        </p>
      ) : tips ? (
        <div className="space-y-4 text-sm">
          {tips.summary && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="font-medium text-blue-400 mb-1.5 text-xs">Summary</div>
              <p className="text-zinc-300 text-xs leading-relaxed">{tips.summary}</p>
            </div>
          )}
          {!!tips.strengths?.length && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="font-medium text-green-400 mb-1.5 text-xs">✓ Strengths</div>
              <ul className="space-y-1">
                {tips.strengths.map((s, i) => (
                  <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!tips.weaknesses?.length && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="font-medium text-orange-400 mb-1.5 text-xs">⚠ Weaknesses</div>
              <ul className="space-y-1">
                {tips.weaknesses.map((s, i) => (
                  <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!tips.suggested_fixes?.length && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="font-medium text-yellow-400 mb-1.5 text-xs">💡 Suggested Fixes</div>
              <ul className="space-y-1.5">
                {tips.suggested_fixes.map((f, i) => (
                  <li key={i} className="text-zinc-300 text-xs">
                    <span className="text-yellow-500">•</span> {f.description || "Fix"}
                    {f.line_hint && <span className="text-zinc-500"> (line {f.line_hint})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!tips.recommendedProblems?.length && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="font-medium text-cyan-400 mb-1.5 text-xs">🎯 Recommended Problems</div>
              <ul className="space-y-1">
                {tips.recommendedProblems.map((p, i) => (
                  <li key={i} className="text-zinc-300 text-xs flex items-center gap-2">
                    <span className="text-cyan-500">•</span>
                    <span>{p.title}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                      p.difficulty === "Easy" ? "bg-green-900/30 text-green-400" :
                      p.difficulty === "Medium" ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-red-900/30 text-red-400"
                    }`}>
                      {p.difficulty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-500 text-sm text-center py-8">
          Write some code to get AI-powered tips and recommendations.
        </p>
      )}
    </div>
  );
}