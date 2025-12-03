"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import RoadmapModal from "@/components/RoadmapModal";

const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const STARTER_BY_LANG = {
  python: "# Write your solution here\n\nclass Solution:\n    def twoSum(self, nums, target):\n        m = {}\n        for i, x in enumerate(nums):\n            if (target - x) in m:\n                return [m[target-x], i]\n            m[x] = i\n        return []\n\nprint(Solution().twoSum([2,7,11,15], 9))\n",
  javascript: "// Write your solution here\nfunction twoSum(nums, target){\n  const m = new Map();\n  for (let i=0;i<nums.length;i++){\n    const x = nums[i];\n    if (m.has(target - x)) return [m.get(target-x), i];\n    m.set(x, i);\n  }\n  return [];\n}\nconsole.log(twoSum([2,7,11,15], 9));\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<int> a = {2,7,11,15};\n  int target = 9;\n  unordered_map<int,int> m;\n  for (int i=0;i<a.size();i++){\n    int x=a[i];\n    if (m.count(target-x)) { cout<<m[target-x]<<\" \"<<i<<\"\\n\"; return 0; }\n    m[x]=i;\n  }\n  return 0;\n}\n",
  java: "import java.util.*;\npublic class Main {\n  public static void main(String[] args){\n    int[] a = {2,7,11,15};\n    int target = 9;\n    Map<Integer,Integer> m = new HashMap<>();\n    for (int i=0;i<a.length;i++){\n      int x=a[i];\n      if (m.containsKey(target-x)) {\n        System.out.println(m.get(target-x)+\" \"+i);\n        return;\n      }\n      m.put(x,i);\n    }\n  }\n}\n",
};

export default function EditorPage() {
  const [language, setLanguage] = useState(process.env.NEXT_PUBLIC_DEFAULT_LANG || "python");
  const [code, setCode] = useState(STARTER_BY_LANG[process.env.NEXT_PUBLIC_DEFAULT_LANG || "python"]);
  const [stdin, setStdin] = useState("");
  const [judgeResult, setJudgeResult] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState(null);
  const [user, setUser] = useState(null);
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const auth = getFirebaseAuth();

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  useEffect(() => {
    async function loadProblem() {
      try {
        const res = await fetch("/api/problems");
        const data = await res.json();
        const first = data.items?.[0] || null;
        setProblem(first);
      } catch {}
    }
    loadProblem();
  }, []);

  useEffect(() => {
    setCode(STARTER_BY_LANG[language] || "");
  }, [language]);

  const editorLanguage = useMemo(() => {
    switch (language) {
      case "python":
        return "python";
      case "javascript":
        return "javascript";
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      default:
        return "plaintext";
    }
  }, [language]);

  function decodeBase64(b64) {
    try {
      if (!b64) return "";
      if (typeof window === "undefined") return Buffer.from(b64, "base64").toString("utf-8");
      return atob(b64);
    } catch {
      return b64;
    }
  }

  async function runCode() {
    setLoading(true);
    setJudgeResult(null);
    setAiReport(null);
    setShowConsole(true);
    try {
      const payload = { language, sourceCode: code, stdin, problem };
      const headers = { "Content-Type": "application/json" };
      if (user) {
        const token = await user.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/compile", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("API Response:", data);
      
      let jr = data.judgeResult || null;
      if (jr) {
        const stdout = jr.stdout ?? jr.output ?? "";
        const stderr = jr.stderr ?? "";
        const compileOutput = jr.compile_output ?? "";
        const decoded = {
          status: jr.status?.description || jr.status?.name || jr.status || "Unknown",
          stdout: jr.stdout_base64 ? decodeBase64(jr.stdout_base64) : (stdout || ""),
          stderr: jr.stderr_base64 ? decodeBase64(jr.stderr_base64) : (stderr || ""),
          compile_output: jr.compile_output_base64 ? decodeBase64(jr.compile_output_base64) : (compileOutput || ""),
          time: jr.time,
          memory: jr.memory,
        };
        jr = decoded;
      }
      setJudgeResult(jr);
      setAiReport(data.aiReport || null);
    } catch (e) {
      console.error("Run code error:", e);
      setJudgeResult({ status: "Client Error", stderr: e?.message || "Unknown error occurred" });
    } finally {
      setLoading(false);
    }
  }

  async function acceptPlan() {
    if (!aiReport?.roadmap?.length) return;
    
    if (!user) {
      alert("⚠️ Please sign in to save your learning roadmap.\n\nYour roadmap will be saved to your dashboard where you can track your progress.");
      return;
    }
    
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/plan/accept", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: `Plan for ${problem?.title || "Practice"}`, 
          planItems: aiReport.roadmap 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ Roadmap saved successfully!\n\nView it in your dashboard to track your progress.`);
        setShowRoadmapModal(false);
      } else {
        alert(`❌ Error: ${data.error || "Failed to save plan"}\n\nPlease try again.`);
      }
    } catch (e) {
      console.error("Error saving plan:", e);
      alert(`❌ Error saving plan: ${e?.message || "Unknown error"}`);
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = document.getElementById("editor-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newPos = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.min(Math.max(newPos, 30), 70));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Render sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CODE-X Editor</h1>
          <p className="text-gray-400 mb-4">Please sign in to use the code editor and save your progress.</p>
          <a href="/signin" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="h-14 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <select
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running...
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-medium transition"
          >
            {showConsole ? "Hide Console" : "Show Console"}
          </button>
        </div>
      </div>

      <div id="editor-container" className="flex-1 flex overflow-hidden relative">
        <div style={{ width: `${splitPos}%` }} className="flex flex-col">
          <div className="flex-1 overflow-hidden border border-neutral-800 m-2 rounded-lg">
            <Editor
              height="100%"
              language={editorLanguage}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{ 
                fontSize: 14, 
                minimap: { enabled: false },
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
                fontLigatures: true,
              }}
            />
          </div>
          
          {showConsole && (
            <div className="h-64 border border-neutral-800 m-2 mt-0 rounded-lg bg-neutral-950 flex flex-col overflow-hidden">
              <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900">
                <h3 className="font-semibold text-sm">Console</h3>
                {judgeResult && (
                  <button 
                    onClick={() => setJudgeResult(null)}
                    className="text-xs text-neutral-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4">
                {judgeResult ? (
                  <div className="text-sm space-y-3">
                    <div className="flex items-center gap-4 text-xs">
                      {judgeResult.status && (
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Status:</span>
                          <span className={`font-medium ${judgeResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                            {judgeResult.status}
                          </span>
                        </div>
                      )}
                      {judgeResult.time && (
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Time:</span>
                          <span className="text-blue-400 font-medium">{judgeResult.time}s</span>
                        </div>
                      )}
                      {typeof judgeResult.memory !== "undefined" && (
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Memory:</span>
                          <span className="text-purple-400 font-medium">{judgeResult.memory} KB</span>
                        </div>
                      )}
                    </div>
                    {judgeResult.compile_output && judgeResult.compile_output.trim() && (
                      <div>
                        <div className="text-orange-400 font-medium mb-1 text-xs">Compiler Output</div>
                        <pre className="whitespace-pre-wrap bg-neutral-900 border border-neutral-800 text-orange-300 rounded-lg p-3 text-xs font-mono">{judgeResult.compile_output}</pre>
                      </div>
                    )}
                    {judgeResult.stdout && judgeResult.stdout.trim() && (
                      <div>
                        <div className="text-green-400 font-medium mb-1 text-xs">Output</div>
                        <pre className="whitespace-pre-wrap bg-neutral-900 border border-neutral-800 text-green-300 rounded-lg p-3 text-xs font-mono">{judgeResult.stdout}</pre>
                      </div>
                    )}
                    {judgeResult.stderr && judgeResult.stderr.trim() && (
                      <div>
                        <div className="text-red-400 font-medium mb-1 text-xs">Error</div>
                        <pre className="whitespace-pre-wrap bg-neutral-900 border border-neutral-800 text-red-300 rounded-lg p-3 text-xs font-mono">{judgeResult.stderr}</pre>
                      </div>
                    )}
                    {!judgeResult.stdout && !judgeResult.stderr && !judgeResult.compile_output && (
                      <pre className="text-neutral-500 text-xs">No output from program.</pre>
                    )}
                  </div>
                ) : (
                  <pre className="text-neutral-500 text-xs">Run your code to see output here...</pre>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="w-1 bg-neutral-800 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 relative group"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-neutral-700 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        <div style={{ width: `${100 - splitPos}%` }} className="flex flex-col overflow-hidden">
          <div className="flex-1 border border-neutral-800 m-2 rounded-lg bg-neutral-950 flex flex-col overflow-hidden">
            <div className="h-12 border-b border-neutral-800 flex items-center px-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
              <h3 className="font-semibold">🤖 AI Coach</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {aiReport ? (
                <div className="space-y-4 text-sm">
                  {aiReport.summary && (
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                      <div className="font-medium text-blue-400 mb-1.5 text-xs">Summary</div>
                      <p className="text-neutral-300 text-xs leading-relaxed">{aiReport.summary}</p>
                    </div>
                  )}
                  {!!aiReport.strengths?.length && (
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                      <div className="font-medium text-green-400 mb-1.5 text-xs">✓ Strengths</div>
                      <ul className="space-y-1">
                        {aiReport.strengths.map((s, i) => (
                          <li key={i} className="text-neutral-300 text-xs flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!aiReport.weaknesses?.length && (
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                      <div className="font-medium text-orange-400 mb-1.5 text-xs">⚠ Weaknesses</div>
                      <ul className="space-y-1">
                        {aiReport.weaknesses.map((s, i) => (
                          <li key={i} className="text-neutral-300 text-xs flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!aiReport.suggested_fixes?.length && (
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                      <div className="font-medium text-yellow-400 mb-1.5 text-xs">💡 Suggested Fixes</div>
                      <ul className="space-y-1.5">
                        {aiReport.suggested_fixes.map((f, i) => (
                          <li key={i} className="text-neutral-300 text-xs">
                            <span className="text-yellow-500">•</span> {f.description || "Fix"}
                            {f.line_hint && <span className="text-neutral-500"> (line {f.line_hint})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!aiReport.roadmap?.length && (
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-purple-400 text-sm">📅 Learning Roadmap Available</div>
                        <span className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-300">
                          {aiReport.roadmap.length} days
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs mb-3">
                        We've created a personalized learning path to help you improve
                      </p>
                      <button
                        onClick={() => setShowRoadmapModal(true)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-sm transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        View Roadmap
                      </button>
                    </div>
                  )}
                  {!!aiReport.recommendedProblems?.length && (
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                      <div className="font-medium text-cyan-400 mb-1.5 text-xs">🎯 Recommended Problems</div>
                      <ul className="space-y-1">
                        {aiReport.recommendedProblems.map((p, i) => (
                          <li key={i} className="text-neutral-300 text-xs flex items-center gap-2">
                            <span className="text-cyan-500">•</span>
                            <span>{p.title}</span>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                              p.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
                              p.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
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
                <p className="text-neutral-500 text-sm text-center py-8">
                  Run your code to get AI-powered feedback and recommendations.
                </p>
              )}
            </div>
          </div>

          <div className="h-48 border border-neutral-800 m-2 mt-0 rounded-lg bg-neutral-950 flex flex-col overflow-hidden">
            <div className="h-10 border-b border-neutral-800 flex items-center px-4 bg-neutral-900">
              <h3 className="font-semibold text-sm">📝 Problem</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {problem ? (
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{problem.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">{problem.statement}</p>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs">
                  No problem loaded. You can still run code.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Roadmap Modal */}
      {showRoadmapModal && aiReport.roadmap && (
        <RoadmapModal 
          roadmap={aiReport.roadmap} 
          onClose={() => setShowRoadmapModal(false)} 
          onAccept={acceptPlan} 
        />
      )}
    </main>
  );
}
