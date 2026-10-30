'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Languages,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ExplanationCard } from '@/components/ExplanationCard';
import { ActionChecklist } from '@/components/ActionChecklist';
import { RevisionQuiz } from '@/components/RevisionQuiz';
import { FollowUpChat } from '@/components/FollowUpChat';
import { WisprModal } from '@/components/WisprModal';
import { SupportedLanguage, TutorialExplanation, ContentCategory } from '@/types';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWisprOpen, setIsWisprOpen] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/history/${sessionId}`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load session');
        }
        setSession(data.session);
      } catch (err: any) {
        setError(err.message || 'Error loading session');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      router.push('/history');
    } catch (err: any) {
      alert(err.message || 'Error deleting session');
    }
  };

  const handleChecklistProgressChange = async (progress: Record<string, boolean>) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistProgress: progress }),
      });
    } catch (err) {
      console.warn('Error saving checklist progress:', err);
    }
  };

  const handleQuizAnswersChange = async (
    answers: Record<string, number>,
    score: number,
    total: number
  ) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizResults: { answers, score, total } }),
      });
    } catch (err) {
      console.warn('Error saving quiz answers:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header onOpenWisprGuide={() => setIsWisprOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading saved tutorial session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header onOpenWisprGuide={() => setIsWisprOpen(true)} />
        <div className="flex-1 max-w-xl w-full mx-auto px-4 py-24 text-center space-y-4">
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center space-x-2 text-sm text-red-300 justify-center">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error || 'Session not found or access denied.'}</span>
          </div>
          <Link
            href="/history"
            className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Learning History</span>
          </Link>
        </div>
      </div>
    );
  }

  const category = (session.content_type as ContentCategory) || 'technical';

  const explanationData: TutorialExplanation = {
    title: session.title,
    contentType: category,
    summary: session.summary || '',
    beginnerExplanation: session.beginner_explanation || '',
    importantConcepts: session.important_concepts || [],
    actionChecklist: session.action_checklist || [],
    quizQuestions: session.quiz_questions || [],
    troubleshootingTips: session.troubleshooting_tips || [],
    sourceExcerpts: session.source_excerpts || [],
    isDemoMode: false,
    provider: 'Saved Workspace',
  };

  const language = (session.language || 'en') as SupportedLanguage;
  const formattedDate = new Date(session.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header onOpenWisprGuide={() => setIsWisprOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <Link
              href="/history"
              className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to History</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {session.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-[11px]">
                {language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'}
              </span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Saved on {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Session</span>
            </button>
          </div>
        </div>

        {/* Section 1: Summary, Explanation & Key Concepts */}
        <ExplanationCard data={explanationData} />

        {/* Section 2: Actionable Checklist */}
        <ActionChecklist
          steps={explanationData.actionChecklist}
          contentType={category}
          initialProgress={session.checklist_progress}
          onProgressChange={handleChecklistProgressChange}
        />

        {/* Section 3: Revision Practice Quiz */}
        <RevisionQuiz
          questions={explanationData.quizQuestions}
          contentType={category}
          initialAnswers={session.quiz_results?.answers}
          onAnswersChange={handleQuizAnswersChange}
        />

        {/* Section 4: Grounded Follow-up Q&A */}
        <FollowUpChat
          transcript={session.transcript || ''}
          language={language}
          contentType={category}
        />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>SpeakBack AI</strong> — Voice-First Multilingual Learning Copilot.
          </div>
        </div>
      </footer>

      <WisprModal isOpen={isWisprOpen} onClose={() => setIsWisprOpen(false)} />
    </div>
  );
}
