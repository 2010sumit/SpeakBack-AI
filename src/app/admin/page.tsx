'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Languages,
  ShieldCheck,
  History,
  Activity,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface OverviewMetrics {
  totalUsers: number;
  totalSessions: number;
  languageBreakdown: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/overview');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load admin overview');
        }
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentLogs(data.recentLogs || []);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm">Loading admin dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span>Access Restricted</span>
        </div>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  const enCount = metrics?.languageBreakdown?.en || 0;
  const hiCount = metrics?.languageBreakdown?.hi || 0;
  const paCount = metrics?.languageBreakdown?.pa || 0;
  const totalLangs = (enCount + hiCount + paCount) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>Admin Overview</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live DB
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System activity metrics, multilingual usage breakdown, and administrative audit trail.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition"
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/sessions"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-300 transition"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>Inspect Sessions</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registered Users
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {metrics?.totalUsers.toLocaleString() ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Authenticated user accounts in Supabase
          </p>
        </div>

        {/* Total Learning Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saved Sessions
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {metrics?.totalSessions.toLocaleString() ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Tutorial workspaces &amp; quiz records saved
          </p>
        </div>

        {/* Hindi & Punjabi Learners */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Indic Usage
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Languages className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {hiCount + paCount}
          </div>
          <p className="text-[11px] text-slate-500">
            Hindi ({hiCount}) + Punjabi ({paCount}) sessions
          </p>
        </div>

        {/* Audit Logs Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audit Status
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            Enforced
          </div>
          <p className="text-[11px] text-slate-500">
            RLS policies active across all tables
          </p>
        </div>
      </div>

      {/* Language Breakdown & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multilingual Learning Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-slate-950/40">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Languages className="h-4 w-4" />
            <span>Language Distribution</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">English</span>
                <span className="text-slate-400">
                  {enCount} ({Math.round((enCount / totalLangs) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${(enCount / totalLangs) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Hindi (हिंदी)</span>
                <span className="text-slate-400">
                  {hiCount} ({Math.round((hiCount / totalLangs) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(hiCount / totalLangs) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Punjabi (ਪੰਜਾਬੀ)</span>
                <span className="text-slate-400">
                  {paCount} ({Math.round((paCount / totalLangs) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(paCount / totalLangs) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Powered by SpeakBack AI Multilingual Engine with Indic translation fidelity.
          </div>
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Activity className="h-4 w-4" />
              <span>Recent Administrative Audit Logs</span>
            </div>

            <Link
              href="/admin/audit-logs"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View full log</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No administrative events recorded yet.
            </p>
          ) : (
            <div className="space-y-2.5 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-medium text-[11px]">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
                    <th className="pb-2">Admin ID</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-mono text-[11px] text-indigo-300">
                        {log.action}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {log.target_type}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-500">
                        {log.admin_id ? log.admin_id.slice(0, 8) + '...' : 'System'}
                      </td>
                      <td className="py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
