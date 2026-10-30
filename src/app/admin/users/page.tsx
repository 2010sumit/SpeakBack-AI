'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  Shield,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  display_name: string | null;
  created_at: string;
  sessionsCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : '/api/admin/users';
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>User Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search user accounts, inspect activity metrics, and verify role assignments.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(searchQuery)}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, phone, or UUID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center space-x-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/40">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
            <p className="text-xs sm:text-sm">Fetching user records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs sm:text-sm">
            No registered users found matching the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User ID / Identity</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Sessions Saved</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const joinedDate = new Date(u.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-medium text-white flex items-center space-x-2">
                          {u.email ? (
                            <span className="flex items-center space-x-1.5">
                              <Mail className="h-3.5 w-3.5 text-indigo-400" />
                              <span>{u.email}</span>
                            </span>
                          ) : u.phone ? (
                            <span className="flex items-center space-x-1.5">
                              <Phone className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{u.phone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">Anonymous Auth</span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          ID: {u.id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1 text-slate-300 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{u.sessionsCount} sessions</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {joinedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
