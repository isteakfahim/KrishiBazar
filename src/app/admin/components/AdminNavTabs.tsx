'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UserRole } from '@prisma/client';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
} from 'lucide-react';

export function AdminNavTabs({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { language } = useLanguage();

  const tabs = [
    {
      href: '/admin',
      labelBn: 'সারসংক্ষেপ ড্যাশবোর্ড',
      labelEn: 'Overview',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      href: '/admin/prices',
      labelBn: 'দৈনিক দর ও CSV আপলোড',
      labelEn: 'Daily Prices & CSV',
      icon: TrendingUp,
      adminOnly: false,
    },
    {
      href: '/admin/products',
      labelBn: 'ফসল মডারেশন',
      labelEn: 'Products Moderation',
      icon: Package,
      adminOnly: true,
    },
    {
      href: '/admin/users',
      labelBn: 'ব্যবহারকারী ও রোল পরিবর্তন',
      labelEn: 'Users & Roles',
      icon: Users,
      adminOnly: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || role === UserRole.ADMIN);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--card-border)]">
      {visibleTabs.map((tab) => {
        const isActive =
          tab.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[var(--green)] text-white shadow-sm'
                : 'text-[var(--ink)]/80 hover:bg-[var(--tint)] hover:text-[var(--green)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
          </Link>
        );
      })}
    </div>
  );
}
