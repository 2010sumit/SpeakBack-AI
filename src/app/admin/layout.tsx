import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin, isSupabaseConfigured } from '@/lib/supabase/auth-helpers';
import {
  ShieldCheck,
  Users,
  BookOpen,
  History,
  ArrowLeft,
  LogOut,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Supabase is not configured yet, show a clean configuration notice
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Configuration Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The database environment variables <code className="text-slate-200">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-slate-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> must be set in your{' '}
            <code className="text-slate-200">.env.local</code> to enable server-side role verification.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to App</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Strict server-side authorization check:
  // Must be logged in AND profile role must equal 'admin'
  let user;
  let profile;
  try {
    const auth = await requireAdmin();
    user = auth.user;
    profile = auth.profile;
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      redirect('/login?redirect=/admin');
    }
    // Authenticated user but not admin -> Deny access by default
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/40 rounded-2xl p-7 text-center space-y-4 shadow-2xl">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">403 — Admin Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account does not have administrator privileges. Normal registered users are denied administrative access by default.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to App</span>
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-xs font-medium text-red-300 border border-red-800/40 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Independent Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1px]">
                <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base tracking-tight">
                  SpeakBack <span className="text-amber-400">Admin</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Role: Admin
                </span>
              </div>
            </Link>

            {/* Admin Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800 text-xs">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
              >
                Users
              </Link>
              <Link
                href="/admin/sessions"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
              >
                Learning Sessions
              </Link>
              <Link
                href="/admin/audit-logs"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
              >
                Audit Logs
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to App</span>
            </Link>

            <div className="hidden sm:block text-slate-400 text-[11px] max-w-[150px] truncate">
              {profile.email || profile.phone || user.id.slice(0, 8)}
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition"
                title="Sign out of Admin session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-[11px] text-slate-500">
        SpeakBack AI Internal Admin Dashboard • Server-Enforced RBAC &amp; Audit Logging Enabled
      </footer>
    </div>
  );
}
