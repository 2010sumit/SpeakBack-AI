'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SupportedLanguage, TutorialExplanation } from '@/types';
import { Header } from '@/components/Header';
import { TranscriptInput } from '@/components/TranscriptInput';
import { ExplanationCard } from '@/components/ExplanationCard';
import { ActionChecklist } from '@/components/ActionChecklist';
import { RevisionQuiz } from '@/components/RevisionQuiz';
import { FollowUpChat } from '@/components/FollowUpChat';
import { WisprModal } from '@/components/WisprModal';
import {
  ArrowDownCircle,
  RefreshCw,
  CheckCircle2,
  Bookmark,
  LogIn,
  Loader2,
  Mic,
  Sparkles,
  BookOpen,
  ListChecks,
  BrainCircuit,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationData, setExplanationData] = useState<TutorialExplanation | null>(null);
  const [isWisprOpen, setIsWisprOpen] = useState(false);

  // Persistence states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user || null);
      } catch {
        setCurrentUser(null);
      }
    }
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleExplain = async () => {
    if (!transcript.trim()) {
      setError('Please paste or dictate your tutorial transcript, notes, or narrative first.');
      return;
    }

    if (transcript.trim().length < 15) {
      setError('The input is too short. Please provide at least a couple of sentences from your tutorial or story.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setSavedSessionId(null);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to explain tutorial.');
      }

      setExplanationData(data);

      // If user is authenticated, persist session to database
      if (currentUser) {
        autoSaveSession(data);
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveSession = async (data: TutorialExplanation) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title || 'Untitled Tutorial',
          language,
          transcript: transcript.trim(),
          summary: data.summary,
          beginnerExplanation: data.beginnerExplanation,
          importantConcepts: data.importantConcepts,
          actionChecklist: data.actionChecklist,
          quizQuestions: data.quizQuestions,
          troubleshootingTips: data.troubleshootingTips,
          sourceExcerpts: data.sourceExcerpts,
          checklistProgress: {},
          quizResults: {},
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result?.session?.id) {
          setSavedSessionId(result.session.id);
          setSaveStatus('Saved to your learning history');
        }
      }
    } catch (err) {
      console.warn('Failed to auto-save session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Sync checklist progress changes
  const handleChecklistProgressChange = async (progress: Record<string, boolean>) => {
    if (!savedSessionId) return;
    try {
      await fetch(`/api/sessions/${savedSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistProgress: progress }),
      });
    } catch (err) {
      console.warn('Error syncing checklist progress:', err);
    }
  };

  // Sync quiz answer changes
  const handleQuizAnswersChange = async (
    answers: Record<string, number>,
    score: number,
    total: number
  ) => {
    if (!savedSessionId) return;
    try {
      await fetch(`/api/sessions/${savedSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizResults: { answers, score, total } }),
      });
    } catch (err) {
      console.warn('Error syncing quiz answers:', err);
    }
  };

  const handleReset = () => {
    setExplanationData(null);
    setTranscript('');
    setError(null);
    setSavedSessionId(null);
    setSaveStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <Header onOpenWisprGuide={() => setIsWisprOpen(true)} />

      {/* Main Workspace */}
      <main className="relative isolate flex-1 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,70,229,0.2),transparent_68%)]"
        />
        <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 px-6 py-8 shadow-2xl shadow-black/20 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-indigo-300/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-indigo-300/[0.08]"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.08] px-3 py-1.5 text-xs font-medium text-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  A more practical way to learn
                </div>

                <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                  Turn what you watch into{' '}
                  <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
                    what you can do.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Bring a tutorial, lecture, or set of notes. Get a clear explanation, practical
                  steps, and a quick knowledge check—in English, Hindi, or Punjabi.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#learning-input"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Create a learning plan
                    <Sparkles className="h-4 w-4" />
                  </a>
                  <span className="inline-flex items-center gap-2 px-2 py-2 text-sm text-slate-400">
                    <Mic className="h-4 w-4 text-indigo-300" />
                    Type or dictate your source
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-5 text-xs font-medium text-slate-400">
                  <span className="text-slate-300">Made for active learning</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
                  <span>English</span>
                  <span>हिंदी</span>
                  <span>ਪੰਜਾਬੀ</span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-4 rounded-[2rem] bg-indigo-500/10 blur-2xl" />
                <div className="relative rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-xl shadow-black/30 backdrop-blur sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                        Your learning loop
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-white">
                        From source to confidence
                      </h2>
                    </div>
                    <div className="rounded-xl border border-indigo-300/15 bg-indigo-300/10 p-2.5 text-indigo-200">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100">Understand</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Make complex ideas easier to follow
                        </p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-slate-500">01</span>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100">Put it into practice</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Follow a focused, actionable checklist
                        </p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-slate-500">02</span>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100">Check what you know</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Review key ideas with a short quiz
                        </p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-slate-500">03</span>
                    </div>
                  </div>
                  <p className="mt-5 border-t border-white/[0.08] pt-4 text-xs leading-5 text-slate-500">
                    One learning workspace, shaped around the way you learn.
                  </p>
                </div>
              </div>
            </div>
          </section>

        {/* Primary Input Card */}
        <section id="learning-input" className="scroll-mt-24">
          <TranscriptInput
            transcript={transcript}
            setTranscript={setTranscript}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handleExplain}
            isLoading={isLoading}
            error={error}
            onOpenWisprGuide={() => setIsWisprOpen(true)}
          />
        </section>

        {/* Generated Workspace Results */}
        {explanationData && (
          <div ref={resultsRef} className="space-y-6 animate-in fade-in duration-300">
            {/* Status & Session Save Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <ArrowDownCircle className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Generated Learning Workspace</span>
              </div>

              <div className="flex items-center space-x-3">
                {currentUser ? (
                  savedSessionId ? (
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{saveStatus || 'Saved to history'}</span>
                      <Link
                        href="/history"
                        className="ml-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                      >
                        View History
                      </Link>
                    </div>
                  ) : isSaving ? (
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span>Saving session...</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => autoSaveSession(explanationData)}
                      className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save Session</span>
                    </button>
                  )
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <span>Sign in to save your checklist and quiz progress:</span>
                    <Link
                      href="/login"
                      className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      <LogIn className="h-3 w-3" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Start New</span>
                </button>
              </div>
            </div>

            {/* Section 1: Summary, Beginner Explanation & Key Concepts */}
            <ExplanationCard data={explanationData} />

            {/* Section 2: Actionable Checklist */}
            <ActionChecklist
              steps={explanationData.actionChecklist}
              contentType={explanationData.contentType}
              onProgressChange={handleChecklistProgressChange}
            />

            {/* Section 3: Knowledge Check Quiz */}
            <RevisionQuiz
              questions={explanationData.quizQuestions}
              contentType={explanationData.contentType}
              onAnswersChange={handleQuizAnswersChange}
            />

            {/* Section 4: Grounded Voice & Text Q&A */}
            <FollowUpChat
              transcript={transcript}
              language={language}
              contentType={explanationData.contentType}
            />
          </div>
        )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>SpeakBack AI</strong> — Learn clearly. Practice actively. Remember more.
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>English • हिंदी • ਪੰਜਾਬੀ</span>
            <span>•</span>
            <button
              onClick={() => setIsWisprOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Wispr Flow Voice Setup
            </button>
          </div>
        </div>
      </footer>

      {/* Wispr Flow Integration Modal */}
      <WisprModal isOpen={isWisprOpen} onClose={() => setIsWisprOpen(false)} />
    </div>
  );
}
