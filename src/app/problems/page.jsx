"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProblemsPage(){
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  async function load(){
    setLoading(true);
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (difficulty) params.set('difficulty', difficulty);
    const res = await fetch(`/api/problems?${params.toString()}`);
    const data = await res.json();
    const problems = data.items || [];
    setItems(problems);
    
    // Calculate stats
    setStats({
      total: problems.length,
      easy: problems.filter(p => p.difficulty === 'Easy').length,
      medium: problems.filter(p => p.difficulty === 'Medium').length,
      hard: problems.filter(p => p.difficulty === 'Hard').length
    });
    
    setLoading(false);
  }

  useEffect(()=>{ load(); },[]);

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'bg-green-900/30 text-green-400 border-green-700';
      case 'Medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'Hard': return 'bg-red-900/30 text-red-400 border-red-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const handleProblemClick = (problemId) => {
    router.push(`/editor?problem=${problemId}`);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-3">
            💻 Coding Problems
          </h1>
          <p className="text-neutral-400">Practice and improve your coding skills</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.total}</div>
            <div className="text-sm text-neutral-500">Total Problems</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.easy}</div>
            <div className="text-sm text-neutral-500">Easy</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-sm text-neutral-500">Medium</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.hard}</div>
            <div className="text-sm text-neutral-500">Hard</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex gap-3 items-center">
            <input 
              value={tag} 
              onChange={(e)=>setTag(e.target.value)} 
              placeholder="Filter by tag" 
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select 
              value={difficulty} 
              onChange={(e)=>setDifficulty(e.target.value)} 
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <button 
              onClick={load} 
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-neutral-400">Loading problems...</div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-xl font-semibold text-neutral-300 mb-2">No problems found</div>
              <div className="text-neutral-500">Try adjusting your filters</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => handleProblemClick(p.id)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 hover:border-purple-700 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side - Problem info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-neutral-500 font-mono text-sm">#{idx + 1}</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
                        {p.title}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                      {p.statement}
                    </p>
                    
                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side - Action button */}
                  <div className="flex items-center">
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition opacity-0 group-hover:opacity-100">
                      Solve →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
