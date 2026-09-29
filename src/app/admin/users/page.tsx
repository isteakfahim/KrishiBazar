import React from 'react';
import { prisma } from '@/lib/prisma';
import { AdminUsersClient, AdminUserItem } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const dbUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers: AdminUserItem[] = dbUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString().substring(0, 10),
  }));

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
          ব্যবহারকারী ও রোল ব্যবস্থাপনা
        </h2>
        <p className="text-xs text-[var(--muted)]">
          সিস্টেমের যেকোনো ব্যবহারকারীর ভূমিকা (ADMIN, PRICE_EDITOR, FARMER, BUYER) পরিবর্তন করুন।
        </p>
      </div>

      <AdminUsersClient initialUsers={formattedUsers} />
    </div>
  );
}
