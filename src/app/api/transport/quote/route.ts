import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTransportQuote } from '@/lib/transport';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDistrictId = searchParams.get('fromDistrictId');
    const toDistrictId = searchParams.get('toDistrictId');
    const weightKg = parseFloat(searchParams.get('weightKg') || '500');

    if (!fromDistrictId || !toDistrictId) {
      return NextResponse.json(
        { error: 'fromDistrictId এবং toDistrictId আবশ্যক।' },
        { status: 400 }
      );
    }

    const [fromDist, toDist] = await Promise.all([
      prisma.district.findUnique({ where: { id: fromDistrictId } }),
      prisma.district.findUnique({ where: { id: toDistrictId } }),
    ]);

    if (!fromDist || !toDist) {
      return NextResponse.json({ error: 'জেলা খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const quote = calculateTransportQuote(
      fromDist.latitude,
      fromDist.longitude,
      toDist.latitude,
      toDist.longitude,
      weightKg
    );

    return NextResponse.json({
      fromDistrict: { id: fromDist.id, nameBn: fromDist.nameBn, nameEn: fromDist.nameEn },
      toDistrict: { id: toDist.id, nameBn: toDist.nameBn, nameEn: toDist.nameEn },
      ...quote,
      disclaimer: 'আনুমানিক হিসাব: বাস্তব রাস্তার ট্রাফিক বা স্থানীয় ঘাটতিভেদে সামান্য তারতম্য হতে পারে।',
    });
  } catch (error) {
    console.error('Transport quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
