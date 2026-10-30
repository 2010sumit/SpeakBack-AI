'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  Clock,
  Languages,
  CheckSquare,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface SessionRecord {
  id: string;
  user_id: string;
  title: string;
  language: string;
  summary: string;
  created_at: string;
  checklist_progress: Record<string, boolean>;
  quiz_results: { score?: number; total?: number };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/admin/sessions?q=${encodeURIComponent(query)}`
        : '/api/admin/sessions';
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch sessions');
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching learning sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions(searchQuery);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>Learning Sessions Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review user-generated tutorial workspaces, language selections, and progress records.
          </p>
        </div>

        <button
          onClick={() => fetchSessions(searchQuery)}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tutorial title or topic..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center space-x-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
          <p className="text-xs sm:text-sm">Fetching session records...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs sm:text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          No learning sessions found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => {
            const completedCount = Object.values(s.checklist_progress || {}).filter(Boolean).length;
            const createdDate = new Date(s.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={s.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg shadow-slate-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {s.language === 'hi' ? 'Hindi' : s.language === 'pa' ? 'Punjabi' : 'English'}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{createdDate}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{s.title}</h3>
                  {s.summary && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {s.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <CheckSquare className="h-3 w-3 text-emerald-400" />
                      <span>{completedCount} steps</span>
                    </div>
                    {s.quiz_results?.score !== undefined && (
                      <div className="flex items-center space-x-1">
                        <HelpCircle className="h-3 w-3 text-amber-400" />
                        <span>Score: {s.quiz_results.score}/{s.quiz_results.total || 3}</span>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-slate-500">
                    User: {s.user_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
