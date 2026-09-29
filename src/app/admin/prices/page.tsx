import React from 'react';
import { prisma } from '@/lib/prisma';
import { PriceEntryManager } from './PriceEntryManager';

export const dynamic = 'force-dynamic';

export default async function AdminPricesPage() {
  const [categories, districts, rawRecentEntries] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: { nameBn: 'asc' },
    }),
    prisma.district.findMany({
      orderBy: { nameBn: 'asc' },
    }),
    prisma.priceHistory.findMany({
      include: {
        category: true,
        district: true,
      },
      orderBy: { date: 'desc' },
      take: 20,
    }),
  ]);

  const recentEntries = rawRecentEntries.map((e) => ({
    id: e.id,
    category: {
      nameBn: e.category.nameBn,
      nameEn: e.category.nameEn,
      icon: e.category.icon,
    },
    district: {
      nameBn: e.district.nameBn,
      nameEn: e.district.nameEn,
    },
    pricePerKg: Number(e.pricePerKg),
    date: e.date.toISOString().substring(0, 10),
    source: e.source,
    isDemo: e.isDemo,
  }));

  return (
    <PriceEntryManager
      categories={categories.map((c) => ({
        id: c.id,
        nameBn: c.nameBn,
        nameEn: c.nameEn,
        slug: c.slug,
        icon: c.icon,
      }))}
      districts={districts.map((d) => ({
        id: d.id,
        nameBn: d.nameBn,
        nameEn: d.nameEn,
      }))}
      recentEntries={recentEntries}
    />
  );
}
