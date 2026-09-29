import React from 'react';
import { prisma } from '@/lib/prisma';
import { CartClient } from './CartClient';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const districts = await prisma.district.findMany({
    orderBy: { nameBn: 'asc' },
  });

  return (
    <CartClient
      districts={districts.map((d) => ({
        id: d.id,
        nameBn: d.nameBn,
        nameEn: d.nameEn,
        latitude: d.latitude,
        longitude: d.longitude,
      }))}
    />
  );
}
