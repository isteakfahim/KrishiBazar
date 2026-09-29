import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PriceSource } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropSlug = searchParams.get('crop') || 'potato';
    const districtName = searchParams.get('district') || 'Bogura';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const category = await prisma.productCategory.findFirst({
      where: {
        OR: [{ slug: cropSlug }, { nameEn: { equals: cropSlug, mode: 'insensitive' } }],
      },
    });

    const district = await prisma.district.findFirst({
      where: {
        OR: [
          { nameEn: { equals: districtName, mode: 'insensitive' } },
          { nameBn: { equals: districtName } },
        ],
      },
    });

    if (!category || !district) {
      return NextResponse.json(
        { error: 'Category or District not found' },
        { status: 404 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const histories = await prisma.priceHistory.findMany({
      where: {
        categoryId: category.id,
        districtId: district.id,
        source: PriceSource.MARKET,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Also get the average or current farmer listed price for this crop & district
    const sampleProduct = await prisma.product.findFirst({
      where: {
        categoryId: category.id,
        districtId: district.id,
        isAvailable: true,
      },
    });

    const farmerPrice = sampleProduct
      ? Number(sampleProduct.pricePerKg)
      : histories.length > 0
      ? Math.round(Number(histories[histories.length - 1].pricePerKg) * 0.96 * 10) / 10
      : 35;

    const formattedData = histories.map((item) => {
      const d = new Date(item.date);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      return {
        rawDate: item.date,
        date: dateStr,
        marketPrice: Number(item.pricePerKg),
        farmerPrice: farmerPrice,
      };
    });

    // Compute trend stats
    const currentPrice = formattedData.length > 0 ? formattedData[formattedData.length - 1].marketPrice : 0;
    const startPrice = formattedData.length > 0 ? formattedData[0].marketPrice : 0;
    const changePercent = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
    const diffFromFarmer = currentPrice > 0 ? ((farmerPrice - currentPrice) / currentPrice) * 100 : 0;

    return NextResponse.json({
      crop: category,
      district: district,
      farmerPrice,
      currentPrice,
      changePercent: Math.round(changePercent * 10) / 10,
      diffFromFarmer: Math.round(diffFromFarmer * 10) / 10,
      trend: changePercent > 2 ? 'RISING' : changePercent < -2 ? 'FALLING' : 'STABLE',
      data: formattedData,
      isDemo: true,
    });
  } catch (error) {
    console.error('Error fetching price chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
