'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Mic,
  History,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  onOpenWisprGuide: () => void;
}

export function Header({ onOpenWisprGuide }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          if (profile?.role) {
            setRole(profile.role);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        // Supabase may not be initialized or unconfigured yet; degrade gracefully
        setUser(null);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile?.role) setRole(profile.role);
        } catch {
          // Ignore
        }
      } else {
        setUser(null);
        setRole('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('user');
    setIsMenuOpen(false);
    router.push('/login');
    router.refresh();
  };

  const displayName = user?.email || user?.phone || 'Learner';

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Mic className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                SpeakBack AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Understand tutorials. Take action. Learn by speaking.
            </p>
          </div>
        </Link>

        {/* Right Badges & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wispr Flow Setup Button */}
          <button
            onClick={onOpenWisprGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
            title="Wispr Flow Voice Setup"
          >
            <Mic className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Wispr Flow Setup</span>
          </button>

          {/* Authenticated Links: History & Admin */}
          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/history"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-800/40 text-xs font-medium transition"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">History</span>
              </Link>

              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-medium transition"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <div className="h-5 w-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                    {displayName[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs text-slate-200 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 truncate">
                      Signed in as <strong className="text-white block truncate">{displayName}</strong>
                    </div>

                    <Link
                      href="/history"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-800 transition"
                    >
                      <History className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Learning History</span>
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-800 transition text-amber-300"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-500/10 text-red-400 transition border-t border-slate-800"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
