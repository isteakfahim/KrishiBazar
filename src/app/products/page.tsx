import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductItem } from '@/components/home/ProductCard';
import { ProductsFilterClient } from '@/components/products/ProductsFilterClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [dbProducts, categories, districts] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true },
      include: {
        district: true,
        category: true,
        farmerProfile: true,
        farm: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productCategory.findMany({
      orderBy: { nameBn: 'asc' },
    }),
    prisma.district.findMany({
      orderBy: { nameBn: 'asc' },
    }),
  ]);

  const formattedProducts: ProductItem[] = dbProducts.map((p) => ({
    id: p.id,
    nameBn: p.nameBn,
    nameEn: p.nameEn,
    pricePerKg: Number(p.pricePerKg),
    quantityAvailable: Number(p.quantityAvailable),
    unit: p.unit,
    minimumOrderQty: Number(p.minimumOrderQty),
    expectedHarvestDate: p.expectedHarvestDate?.toISOString() || null,
    imageUrl: p.imageUrl,
    districtId: p.districtId,
    district: {
      id: p.district.id,
      nameBn: p.district.nameBn,
      nameEn: p.district.nameEn,
    },
    category: {
      id: p.category.id,
      nameBn: p.category.nameBn,
      nameEn: p.category.nameEn,
      icon: p.category.icon,
    },
    farmerProfile: p.farmerProfile
      ? {
          id: p.farmerProfile.id,
          fullName: p.farmerProfile.fullName,
          phone: p.farmerProfile.phone,
        }
      : null,
    farm: p.farm
      ? {
          name: p.farm.name,
          latitude: p.farm.latitude,
          longitude: p.farm.longitude,
        }
      : null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমে ফিরুন</span>
          </Link>
          <h1 className="text-3xl font-extrabold font-heading text-[var(--ink)]">
            কৃষি ফসল বাজার
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            সরাসরি কৃষকদের নিবন্ধিত খামার থেকে সেরা মানের ফসল কিনুন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-[var(--tint)] text-[var(--green)] font-bold border border-[var(--card-border)]">
            মোট উপলভ্য ফসল: {formattedProducts.length} টি
          </span>
        </div>
      </div>

      <ProductsFilterClient
        initialProducts={formattedProducts}
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
      />
    </div>
  );
}
