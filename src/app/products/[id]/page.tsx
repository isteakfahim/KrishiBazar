import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [product, districts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        district: true,
        category: true,
        farmerProfile: {
          include: {
            district: true,
          },
        },
        farm: true,
      },
    }),
    prisma.district.findMany({
      orderBy: { nameBn: 'asc' },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Fetch last 30 days price history for this crop category and district
  const rawPriceHistory = await prisma.priceHistory.findMany({
    where: {
      categoryId: product.categoryId,
      districtId: product.districtId,
    },
    orderBy: { date: 'asc' },
    take: 30,
  });

  const formattedPriceHistory = rawPriceHistory.map((h) => ({
    date: h.date.toISOString().substring(0, 10),
    price: Number(h.pricePerKg),
  }));

  const formattedProduct = {
    id: product.id,
    nameBn: product.nameBn,
    nameEn: product.nameEn,
    descriptionBn: product.descriptionBn,
    descriptionEn: product.descriptionEn,
    pricePerKg: Number(product.pricePerKg),
    quantityAvailable: Number(product.quantityAvailable),
    unit: product.unit,
    minimumOrderQty: Number(product.minimumOrderQty),
    expectedHarvestDate: product.expectedHarvestDate?.toISOString() || null,
    imageUrl: product.imageUrl,
    category: {
      id: product.category.id,
      nameBn: product.category.nameBn,
      nameEn: product.category.nameEn,
      icon: product.category.icon,
    },
    district: {
      id: product.district.id,
      nameBn: product.district.nameBn,
      nameEn: product.district.nameEn,
      latitude: product.district.latitude,
      longitude: product.district.longitude,
    },
    farmerProfile: {
      id: product.farmerProfile.id,
      fullName: product.farmerProfile.fullName,
      phone: product.farmerProfile.phone,
      bio: product.farmerProfile.bio,
      district: {
        nameBn: product.farmerProfile.district.nameBn,
        nameEn: product.farmerProfile.district.nameEn,
      },
    },
    farm: product.farm
      ? {
          id: product.farm.id,
          name: product.farm.name,
          landSize: Number(product.farm.landSize),
          landUnit: product.farm.landUnit,
          mainCrops: product.farm.mainCrops,
          latitude: product.farm.latitude,
          longitude: product.farm.longitude,
          description: product.farm.description,
        }
      : null,
  };

  return (
    <ProductDetailClient
      product={formattedProduct}
      districts={districts.map((d) => ({
        id: d.id,
        nameBn: d.nameBn,
        nameEn: d.nameEn,
        latitude: d.latitude,
        longitude: d.longitude,
      }))}
      priceHistory={formattedPriceHistory}
    />
  );
}
