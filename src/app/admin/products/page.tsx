import React from 'react';
import { prisma } from '@/lib/prisma';
import { AdminProductsClient, AdminProductItem } from './AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const dbProducts = await prisma.product.findMany({
    include: {
      category: true,
      district: true,
      farmerProfile: true,
      farm: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedProducts: AdminProductItem[] = dbProducts.map((p) => ({
    id: p.id,
    nameBn: p.nameBn,
    nameEn: p.nameEn,
    pricePerKg: Number(p.pricePerKg),
    quantityAvailable: Number(p.quantityAvailable),
    unit: p.unit,
    isAvailable: p.isAvailable,
    imageUrl: p.imageUrl,
    category: {
      nameBn: p.category.nameBn,
      nameEn: p.category.nameEn,
      icon: p.category.icon,
    },
    district: {
      nameBn: p.district.nameBn,
      nameEn: p.district.nameEn,
    },
    farmer: {
      fullName: p.farmerProfile?.fullName || 'Unknown',
      phone: p.farmerProfile?.phone || '',
    },
    farmName: p.farm?.name || 'Verified Farm',
    createdAt: p.createdAt.toISOString().substring(0, 10),
  }));

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
          ফসল সামগ্রী পর্যবেক্ষণ ও নিয়ন্ত্রণ
        </h2>
        <p className="text-xs text-[var(--muted)]">
          অনুপযুক্ত বা ভুল তথ্যযুক্ত ফসল দ্রুত লুকিয়ে রাখুন অথবা স্থায়ীভাবে মুছে ফেলুন।
        </p>
      </div>

      <AdminProductsClient initialProducts={formattedProducts} />
    </div>
  );
}
