'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  HelpCircle,
  Languages,
  Loader2,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { WisprModal } from '@/components/WisprModal';

interface SavedSessionItem {
  id: string;
  title: string;
  language: string;
  summary: string;
  created_at: string;
  checklist_progress: Record<string, boolean>;
  quiz_results: { answers?: Record<string, number>; score?: number; total?: number };
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isWisprOpen, setIsWisprOpen] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions');
      if (res.status === 401) {
        router.push('/login?redirect=/history');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch sessions.');
      }
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Error loading learning history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this learning session? This cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete session.');
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting session.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = languageFilter === 'all' || s.language === languageFilter;
    return matchesSearch && matchesLang;
  });

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'hi':
        return 'Hindi (हिंदी)';
      case 'pa':
        return 'Punjabi (ਪੰਜਾਬੀ)';
      case 'en':
      default:
        return 'English';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header onOpenWisprGuide={() => setIsWisprOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb / Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium mb-1">
              <Link href="/" className="hover:text-indigo-300 flex items-center space-x-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span>Learning History</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Learning History
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Access your saved tutorials, checklist progress, and quiz scores.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Tutorial</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past sessions by tutorial title or keyword..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
            </select>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center space-x-3 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Content Loading / Empty / List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            <p className="text-xs sm:text-sm">Retrieving your learning sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No learning sessions found</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery || languageFilter !== 'all'
                  ? 'No sessions match your search filters. Try clearing the search query.'
                  : 'You have not saved any tutorials yet. Paste a video transcript or notes on the home page to get started.'}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
            >
              <span>Explain a Tutorial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((s) => {
              const completedCount = Object.values(s.checklist_progress || {}).filter(Boolean).length;
              const formattedDate = new Date(s.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={s.id}
                  className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition shadow-lg shadow-slate-950/40 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header meta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {getLanguageLabel(s.language)}
                      </span>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/history/${s.id}`} className="block">
                      <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                        {s.title}
                      </h2>
                    </Link>

                    {/* Summary */}
                    {s.summary && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {s.summary}
                      </p>
                    )}
                  </div>

                  {/* Badges / Metrics */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-400">
                      <div className="flex items-center space-x-1" title="Completed Checklist Steps">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{completedCount} steps checked</span>
                      </div>
                      {s.quiz_results?.score !== undefined && (
                        <div className="flex items-center space-x-1" title="Quiz Score">
                          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                          <span>
                            {s.quiz_results.score}/{s.quiz_results.total || 3} scored
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        disabled={deletingId === s.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Session"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>

                      <Link
                        href={`/history/${s.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center"
                        title="View Full Session"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>SpeakBack AI</strong> — Voice-First Multilingual Learning Copilot.
          </div>
          <div className="text-slate-400">
            <span>Secure User Isolation via Supabase Row-Level Security</span>
          </div>
        </div>
      </footer>

      <WisprModal isOpen={isWisprOpen} onClose={() => setIsWisprOpen(false)} />
    </div>
  );
}
