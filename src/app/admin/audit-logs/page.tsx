'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch audit logs');
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable log of all administrative actions, data accesses, and role changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Administrative Actions</option>
          <option value="VIEW">Views &amp; Inspections</option>
          <option value="SEARCH">Searches</option>
          <option value="BOOTSTRAP">Role Bootstrapping</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center space-x-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/40">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
            <p className="text-xs sm:text-sm">Fetching audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs sm:text-sm">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Admin ID</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-amber-300 font-semibold">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.target_type}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.admin_id ? log.admin_id.slice(0, 8) + '...' : 'System'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
