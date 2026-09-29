import { prisma } from '@/lib/prisma';
import { ProductItem } from '@/components/home/ProductCard';
import { HomeClientWrapper } from '@/components/home/HomeClientWrapper';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query seeded products from PostgreSQL
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    include: {
      district: true,
      category: true,
      farmerProfile: true,
      farm: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.productCategory.findMany({
    orderBy: { nameEn: 'asc' },
  });

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
    district: {
      nameBn: p.district.nameBn,
      nameEn: p.district.nameEn,
    },
    category: {
      nameBn: p.category.nameBn,
      nameEn: p.category.nameEn,
      icon: p.category.icon,
    },
    farmerProfile: p.farmerProfile
      ? {
          fullName: p.farmerProfile.fullName,
          phone: p.farmerProfile.phone,
        }
      : null,
    farm: p.farm ? { name: p.farm.name } : null,
  }));

  return (
    <HomeClientWrapper
      products={formattedProducts}
      categories={categories.map((c) => ({
        id: c.id,
        nameBn: c.nameBn,
        nameEn: c.nameEn,
        slug: c.slug,
        icon: c.icon,
      }))}
    />
  );
}
