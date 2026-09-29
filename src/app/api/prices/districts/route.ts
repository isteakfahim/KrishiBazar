import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PriceSource } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropSlug = searchParams.get('crop') || 'potato';

    const category = await prisma.productCategory.findFirst({
      where: {
        OR: [{ slug: cropSlug }, { nameEn: { equals: cropSlug, mode: 'insensitive' } }],
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' }, { status: 404 });
    }

    // Get the latest price entry per district for this crop
    const latestHistories = await prisma.priceHistory.findMany({
      where: {
        categoryId: category.id,
        source: PriceSource.MARKET,
      },
      include: {
        district: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Deduplicate by district to get the latest per district
    const districtMap = new Map<string, typeof latestHistories[0]>();
    for (const h of latestHistories) {
      if (!districtMap.has(h.districtId)) {
        districtMap.set(h.districtId, h);
      }
    }

    const items = Array.from(districtMap.values()).map((h) => ({
      districtId: h.districtId,
      districtNameBn: h.district.nameBn,
      districtNameEn: h.district.nameEn,
      division: h.district.division,
      pricePerKg: Number(h.pricePerKg),
      date: h.date,
    }));

    // Sort descending by price
    items.sort((a, b) => b.pricePerKg - a.pricePerKg);

    return NextResponse.json({
      crop: category,
      districts: items,
    });
  } catch (error) {
    console.error('District prices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
