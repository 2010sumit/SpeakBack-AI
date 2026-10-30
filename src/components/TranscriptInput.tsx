'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage } from '@/types';
import { EXPRESS_SAMPLE_TRANSCRIPT } from '@/lib/sampleTutorial';
import {
  FileText,
  Loader2,
  Globe,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Compass,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_STORY_TRANSCRIPT = `Last autumn, I traveled to the mountain village of Shirakawa-go in Japan. The traditional gassho-zukuri farmhouses had steep thatched roofs designed to withstand heavy winter snow. I stayed with a local family who prepared hot nabe stew for dinner over an open hearth called an irori. Walking through the misty rice paddies early the next morning was the most peaceful experience of my life.`;

interface TranscriptInputProps {
  transcript: string;
  setTranscript: (val: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  onOpenWisprGuide?: () => void;
}

export function TranscriptInput({
  transcript,
  setTranscript,
  language,
  setLanguage,
  onSubmit,
  isLoading,
  error,
  onOpenWisprGuide,
}: TranscriptInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const languages: { code: SupportedLanguage; label: string; script: string; bcp47: string }[] = [
    { code: 'en', label: 'English', script: 'EN', bcp47: 'en-US' },
    { code: 'hi', label: 'Hindi', script: 'हिंदी', bcp47: 'hi-IN' },
    { code: 'pa', label: 'Punjabi', script: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  ];

  // Initialize SpeechRecognition on mount or language change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const langConfig = languages.find((l) => l.code === language);
        recognition.lang = langConfig?.bcp47 || 'en-US';

        let accumulated = '';

        recognition.onstart = () => {
          setIsRecording(true);
          setVoiceError(null);
          accumulated = transcript ? transcript + ' ' : '';
        };

        recognition.onresult = (event: any) => {
          let currentSpoken = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentSpoken += event.results[i][0].transcript;
          }
          if (currentSpoken) {
            setTranscript(accumulated + currentSpoken);
          }
        };

        recognition.onerror = (event: any) => {
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setVoiceError(
              'Microphone access denied. Please click the camera/microphone icon in your browser address bar to allow access, or use Wispr Flow desktop dictation.'
            );
          } else if (event.error === 'no-speech') {
            setVoiceError('No speech detected. Please speak closer to your microphone.');
          } else {
            setVoiceError(`Voice dictation note: ${event.error}. You can continue typing.`);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [language, transcript]);

  const toggleRecording = () => {
    setVoiceError(null);

    if (!recognitionRef.current) {
      setVoiceError(
        'Browser speech recognition is not supported in this browser. Use Chrome, Edge, Safari, or run the Wispr Flow desktop app to dictate directly.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.warn('Voice start exception:', e);
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {
          setVoiceError('Could not start microphone recording. Please check browser permissions.');
        }
      }
    }
  };

  const handleLoadCodingSample = () => {
    setTranscript(EXPRESS_SAMPLE_TRANSCRIPT);
  };

  const handleLoadStorySample = () => {
    setTranscript(SAMPLE_STORY_TRANSCRIPT);
  };

  return (
    <div className="space-y-5 rounded-3xl border border-white/[0.08] bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
      {/* Top Header with Sample Loaders & Voice Indicator */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-2.5">
          <div className="rounded-xl border border-indigo-300/15 bg-indigo-300/10 p-2.5 text-indigo-200">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white sm:text-lg">Add your learning material</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
              Paste notes or a transcript, or dictate directly into the editor.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleLoadCodingSample}
            disabled={isLoading || isRecording}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-300 transition hover:border-indigo-300/30 hover:bg-indigo-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-300" />
            <span>Express.js sample</span>
          </button>

          <button
            type="button"
            onClick={handleLoadStorySample}
            disabled={isLoading || isRecording}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-300" />
            <span>Story sample</span>
          </button>
        </div>
      </div>

      {/* Main Textarea with live voice overlay */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/80 transition focus-within:border-indigo-300/40 focus-within:ring-4 focus-within:ring-indigo-400/[0.08]">
        <textarea
          rows={8}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          disabled={isLoading}
          aria-label="Tutorial transcript, notes, or learning material"
          placeholder="Paste a transcript, tutorial notes, or anything you want to understand…"
          className={`min-h-56 w-full resize-y bg-transparent px-5 pb-12 pt-5 text-sm leading-7 text-slate-100 placeholder:text-slate-500 focus:outline-none sm:text-base ${
            isRecording ? 'ring-2 ring-inset ring-indigo-400/50' : ''
          }`}
        />

        {/* Floating Voice Dictate Button on Textarea */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {isRecording ? (
            <button
              type="button"
              onClick={toggleRecording}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium animate-pulse shadow-sm"
              title="Stop voice recording"
            >
              <MicOff className="h-3.5 w-3.5 text-red-400" />
              <span>Recording... Click to Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm"
              title="Dictate tutorial notes with microphone"
            >
              <Mic className="h-3.5 w-3.5 text-indigo-400" />
              <span>Dictate Voice</span>
            </button>
          )}
        </div>

        <div className="absolute bottom-3 right-4 rounded-md bg-slate-950/90 px-2 py-1 text-[11px] text-slate-500">
          {transcript.length.toLocaleString()} characters
        </div>
      </div>

      {/* Voice Error Notification */}
      {voiceError && (
        <div className="p-3 bg-slate-950 border border-amber-900/40 rounded-lg flex items-start justify-between space-x-2 text-xs text-amber-300">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{voiceError}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceError(null)}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert from API */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg flex items-start space-x-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Bottom Controls: Language Selector + Primary Submit Button */}
      <div className="flex flex-col justify-between gap-5 pt-1 sm:flex-row sm:items-center">
        {/* Language Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <span>Explain in</span>
          </div>

          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-slate-950/70 p-1">
            {languages.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  disabled={isLoading || isRecording}
                  className={`min-h-9 rounded-lg px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    active
                      ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-950/50'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                  }`}
                >
                  <span>{lang.label}</span>{' '}
                  <span className={`ml-0.5 text-[10px] ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                    ({lang.script})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          {onOpenWisprGuide && (
            <button
              type="button"
              onClick={onOpenWisprGuide}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 flex items-center space-x-1"
            >
              <Mic className="h-3 w-3 text-indigo-400" />
              <span>Wispr Flow Setup</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !transcript.trim() || isRecording}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing source...</span>
              </>
            ) : (
              <>
                <span>Generate Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
