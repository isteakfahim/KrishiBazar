'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRoleAction } from '../actions';
import { UserRole } from '@prisma/client';
import {
  Search,
  ShieldCheck,
  Tractor,
  TrendingUp,
  ShoppingBag,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUserItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredUsers = initialUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    setMessage(null);

    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setMessage('ব্যবহারকারীর ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে।');
      router.refresh();
    }
    setUpdatingId(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', icon: ShieldCheck, color: 'bg-emerald-800 text-white' };
      case 'PRICE_EDITOR':
        return { label: 'Price Editor', icon: TrendingUp, color: 'bg-amber-700 text-white' };
      case 'FARMER':
        return { label: 'Farmer', icon: Tractor, color: 'bg-green-700 text-white' };
      default:
        return { label: 'Buyer', icon: ShoppingBag, color: 'bg-teal-700 text-white' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
          />
        </div>

        <span className="text-xs text-[var(--muted)]">
          মোট নিবন্ধিত ইউজার: {filteredUsers.length} জন
        </span>
      </div>

      {message && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg)] border-b border-[var(--card-border)] text-[var(--muted)]">
              <tr>
                <th className="py-3 px-4">নাম</th>
                <th className="py-3 px-4">ইমেইল</th>
                <th className="py-3 px-4">মোবাইল নম্বর</th>
                <th className="py-3 px-4">বর্তমান ভূমিকা</th>
                <th className="py-3 px-4">যোগদানের তারিখ</th>
                <th className="py-3 px-4 text-right">রোল পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredUsers.map((u) => {
                const badge = getRoleBadge(u.role);
                const isUpdating = updatingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-[var(--bg)]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--ink)]">{u.name}</td>
                    <td className="py-3 px-4 text-[var(--muted)] font-mono">{u.email}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)]">{u.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--green)]" />}
                        <select
                          value={u.role}
                          disabled={isUpdating}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                        >
                          <option value="BUYER">BUYER (ক্রেতা)</option>
                          <option value="FARMER">FARMER (কৃষক)</option>
                          <option value="PRICE_EDITOR">PRICE_EDITOR (দর নিয়ন্ত্রক)</option>
                          <option value="ADMIN">ADMIN (অ্যাডমিন)</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
