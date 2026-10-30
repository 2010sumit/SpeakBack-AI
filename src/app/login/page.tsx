'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Mic,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

type AuthMode = 'email_password' | 'magic_link' | 'phone_otp';
type ActionType = 'signin' | 'signup';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<AuthMode>('email_password');
  const [actionType, setActionType] = useState<ActionType>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon || url.includes('placeholder') || anon.includes('placeholder')) {
      setIsConfigured(false);
    }
  }, []);

  // 1. Email + Password (Sign In / Sign Up)
  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (actionType === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          },
        });

        if (error) throw error;

        if (data?.session) {
          router.push(redirectPath);
          router.refresh();
        } else {
          setSuccessMsg(
            'Account created! A confirmation link has been sent to your email. Please verify your email before logging in.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) throw error;

      setSuccessMsg('Magic login link sent! Check your email inbox to log in.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Phone SMS OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !phone.startsWith('+')) {
      setErrorMsg('Please enter a valid phone number with country code (e.g., +1234567890 or +919876543210).');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('sms') ||
          error.message?.toLowerCase().includes('provider') ||
          error.message?.toLowerCase().includes('twilio') ||
          error.message?.toLowerCase().includes('unsupported')
        ) {
          setErrorMsg(
            `SMS Provider Notice: ${error.message}. Phone SMS OTP requires Twilio, MessageBird, or Vonage configured in your Supabase project under Authentication > Providers > Phone.`
          );
        } else {
          throw error;
        }
        return;
      }

      setOtpSent(true);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${phone}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Phone SMS OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken.trim() || otpToken.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otpToken.trim(),
        type: 'sms',
      });

      if (error) throw error;

      if (data?.session) {
        router.push(redirectPath);
        router.refresh();
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand / Logo */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Mic className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            SpeakBack AI
          </span>
        </Link>
        <h1 className="text-xl font-semibold text-white">
          {mode === 'phone_otp'
            ? 'Sign in with Phone SMS'
            : mode === 'magic_link'
            ? 'Passwordless Magic Link'
            : actionType === 'signin'
            ? 'Welcome back'
            : 'Create your account'}
        </h1>
        <p className="text-xs text-slate-400">
          Persist your tutorial learning history, checklists, and quiz progress.
        </p>
      </div>

      {/* Missing Supabase Config Notice */}
      {!isConfigured && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
          <div className="flex items-center space-x-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Supabase Environment Setup Required</span>
          </div>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            To connect real authentication and persistence, add <code className="text-white">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="text-white">.env.local</code> file and run the SQL migration.
          </p>
        </div>
      )}

      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => {
            setMode('email_password');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`py-2 rounded-lg font-medium transition ${
            mode === 'email_password'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('magic_link');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`py-2 rounded-lg font-medium transition ${
            mode === 'magic_link'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('phone_otp');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`py-2 rounded-lg font-medium transition ${
            mode === 'phone_otp'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Phone SMS
        </button>
      </div>

      {/* Card Box */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl shadow-slate-950/60 backdrop-blur-sm space-y-4">
        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start space-x-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-start space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* Mode 1: Email + Password */}
        {mode === 'email_password' && (
          <form onSubmit={handleEmailPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{actionType === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActionType(actionType === 'signin' ? 'signup' : 'signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                {actionType === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Magic Link */}
        {mode === 'magic_link' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              We will email you a secure, single-use login link. Click it to immediately access your account without typing a password.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Send Magic Link</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 3: Phone / SMS OTP */}
        {mode === 'phone_otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phone Number (E.164 format with country code)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+14155552671 or +919876543210"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Include country code (e.g. +1 for US/Canada, +91 for India).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending SMS OTP...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      <span>Send SMS Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Enter 6-Digit SMS Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpToken('');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Change number ({phone})
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify &amp; Continue</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="text-center text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition">
          ← Return to SpeakBack AI Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 py-12 text-slate-100">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs">Loading authentication...</p>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
