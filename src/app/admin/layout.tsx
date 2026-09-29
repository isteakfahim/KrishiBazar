import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import {
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { AdminNavTabs } from './components/AdminNavTabs';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin');
  }

  const role = (session.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN && role !== UserRole.PRICE_EDITOR) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মূল প্ল্যাটফর্মে ফিরুন</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--green)] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
                অ্যাডমিন ও মার্কেট নিয়ন্ত্রণ কেন্দ্র
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                বাজার দর নিয়ন্ত্রণ, ব্যবহারকারীর ভূমিকা, এবং ফসল সামগ্রীর সার্বিক ব্যবস্থাপনা
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--tint)] text-[var(--green)] border border-[var(--card-border)]">
            ইউজার রোল: {role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <AdminNavTabs role={role} />

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
