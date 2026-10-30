'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Key,
  Laptop,
  Check,
} from 'lucide-react';

interface WisprModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'desktop' | 'api' | 'promo';

export function WisprModal({ isOpen, onClose }: WisprModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('desktop');
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check server-side voice API configuration status
      fetch('/api/voice/transcribe')
        .then((res) => res.json())
        .then((data) => {
          setApiStatus({
            configured: Boolean(data.wisprApiConfigured),
            message: data.provider,
          });
        })
        .catch(() => {
          setApiStatus({ configured: false });
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Wispr Flow Voice Setup &amp; Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Voice-to-text dictation guide, promo code status, and API integration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`py-2 rounded-lg font-medium transition ${
              activeTab === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Desktop Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`py-2 rounded-lg font-medium transition ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice Interface API
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`py-2 rounded-lg font-medium transition ${
              activeTab === 'promo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HHGFLOWS Promo
          </button>
        </div>

        {/* Tab 1: Desktop Workflow */}
        {activeTab === 'desktop' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-white">
                <Laptop className="h-4 w-4 text-indigo-400" />
                <span>Native System-Wide Voice Dictation</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Wispr Flow is an AI-powered voice assistant running natively on macOS and Windows. When active on your machine, it automatically transcribes speech into any focused browser input field.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-200 text-xs">How to use with SpeakBack AI:</h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-400 leading-relaxed">
                <li>Install and launch Wispr Flow on your operating system (<a href="https://wisprflow.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">wisprflow.ai</a>).</li>
                <li>Click into SpeakBack AI&apos;s tutorial input textarea or follow-up question field.</li>
                <li>Press your Wispr Flow dictation hotkey (e.g. <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Fn</code> or push-to-talk).</li>
                <li>Speak naturally. Wispr Flow will format your speech and insert the transcript directly into the editor.</li>
              </ol>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-emerald-300">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Built-in browser microphone dictation is also enabled in this app via Web Speech API.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Voice Interface API */}
        {activeTab === 'api' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-white">
                <Key className="h-4 w-4 text-amber-400" />
                <span>Wispr Flow Voice Interface API Status</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Wispr Flow operates a private developer Voice Interface API at <code className="text-slate-200">platform-api.wisprflow.ai/api/v1/dash/api</code>.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-200 text-xs">Architecture &amp; Credentials:</h4>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400 leading-relaxed">
                <li>
                  <strong>Server Proxy:</strong> SpeakBack AI provides a secure server endpoint at <code className="text-slate-200">/api/voice/transcribe</code> that proxies audio with <code className="text-slate-200">Authorization: Bearer WISPR_FLOW_API_KEY</code>.
                </li>
                <li>
                  <strong>Security:</strong> All credentials remain server-side. No API keys are bundled into frontend code.
                </li>
                <li>
                  <strong>Current Status:</strong> {apiStatus?.configured ? (
                    <span className="text-emerald-400 font-semibold">Configured with server API key.</span>
                  ) : (
                    <span className="text-amber-400">WISPR_FLOW_API_KEY is not set in .env.local. Browser Web Speech API is acting as the voice engine.</span>
                  )}
                </li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              <strong>Official Documentation Note:</strong> Wispr Flow states that developer API partnerships are currently restricted to an exclusive set of partners.
            </div>
          </div>
        )}

        {/* Tab 3: Promo Code HHGFLOWS */}
        {activeTab === 'promo' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-indigo-300">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Promo Code: HHGFLOWS</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                The promo code <code className="text-white bg-indigo-950/80 px-1.5 py-0.5 rounded font-mono font-bold">HHGFLOWS</code> was created for the HackerHouse Goa (HHGoa) partner community.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-200 text-xs">How it Works:</h4>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-400 leading-relaxed">
                <li>
                  <strong>Redemption Location:</strong> Redeem in the Wispr Flow desktop app or account billing at <a href="https://wisprflow.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">wisprflow.ai</a>.
                </li>
                <li>
                  <strong>Benefit:</strong> Provides usage credits or pro tier access for end-user dictation.
                </li>
                <li>
                  <strong>Important Notice:</strong> Entering a promo code in an end-user billing portal does <em>not</em> automatically grant an organization developer API key. If Wispr grants your team a developer API key, place it in <code className="text-slate-200">WISPR_FLOW_API_KEY</code>.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://wisprflow.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Visit Wispr Flow</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
