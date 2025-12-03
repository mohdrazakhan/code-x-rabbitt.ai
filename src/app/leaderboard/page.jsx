"use client";
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function LeaderboardPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const auth = getFirebaseAuth();

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setItems(data.items || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  },[timeFilter]);

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-amber-500';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-400 to-amber-600';
      default: return 'from-neutral-600 to-neutral-700';
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                🏆 Leaderboard
              </h1>
              <p className="text-neutral-400">Compete with top coders worldwide</p>
            </div>
            
            {/* Time Filter */}
            <div className="flex gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              {['all', 'week', 'month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    timeFilter === filter 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          {!loading && items.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-3xl mb-3 border-4 border-gray-400 shadow-lg">
                  🥈
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{items[1]?.displayName || 'User'}</div>
                  <div className="text-2xl font-bold text-gray-300">{items[1]?.points || 0}</div>
                  <div className="text-xs text-neutral-500">points</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-4xl mb-3 border-4 border-yellow-400 shadow-2xl animate-pulse">
                  🥇
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">{items[0]?.displayName || 'Champion'}</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {items[0]?.points || 0}
                  </div>
                  <div className="text-xs text-neutral-500">points</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-3xl mb-3 border-4 border-orange-500 shadow-lg">
                  🥉
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{items[2]?.displayName || 'User'}</div>
                  <div className="text-2xl font-bold text-orange-400">{items[2]?.points || 0}</div>
                  <div className="text-xs text-neutral-500">points</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-800/50 border-b border-neutral-700 text-sm font-semibold text-neutral-400">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6">User</div>
            <div className="col-span-2 text-center">Problems</div>
            <div className="col-span-3 text-right">Points</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-neutral-400">Loading leaderboard...</div>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <div className="text-xl font-semibold text-neutral-300 mb-2">No users yet</div>
                <div className="text-neutral-500">Be the first to solve problems and claim the top spot!</div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {items.map((item, idx) => {
                const isCurrentUser = user && item.uid === user.uid;
                const medal = getMedalIcon(item.rank);
                
                return (
                  <div 
                    key={item.uid}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-800/30 transition ${
                      isCurrentUser ? 'bg-purple-900/20 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      {medal ? (
                        <span className="text-3xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-neutral-400">#{item.rank}</span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="col-span-6 flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(item.rank)} flex items-center justify-center text-white font-bold text-sm`}>
                        {(item.displayName || item.uid).charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Name */}
                      <div className="flex flex-col">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {item.displayName || `User ${item.uid.slice(0, 6)}`}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">You</span>
                          )}
                        </div>
                        {item.email && (
                          <div className="text-xs text-neutral-500">{item.email}</div>
                        )}
                      </div>
                    </div>

                    {/* Problems Solved */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{item.problemsSolved || 0}</div>
                        <div className="text-xs text-neutral-500">solved</div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {item.points || 0}
                        </div>
                        <div className="text-xs text-neutral-500">points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && items.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{items.length}</div>
              <div className="text-sm text-neutral-500">Total Users</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {items.reduce((acc, item) => acc + (item.problemsSolved || 0), 0)}
              </div>
              <div className="text-sm text-neutral-500">Problems Solved</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {items.reduce((acc, item) => acc + (item.points || 0), 0)}
              </div>
              <div className="text-sm text-neutral-500">Total Points</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
