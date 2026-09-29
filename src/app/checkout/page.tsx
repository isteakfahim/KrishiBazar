import React from 'react';
import { prisma } from '@/lib/prisma';
import { CheckoutClient } from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const districts = await prisma.district.findMany({
    orderBy: { nameBn: 'asc' },
  });

  return (
    <CheckoutClient
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
