'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const FarmMapClient = dynamic(() => import('./FarmMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-[var(--tint)]/50 rounded-2xl flex items-center justify-center text-xs text-[var(--muted)] animate-pulse">
      মানচিত্র প্রস্তুত হচ্ছে...
    </div>
  ),
});

interface Props {
  latitude: number;
  longitude: number;
  farmName: string;
  districtName: string;
  zoom?: number;
}

export function FarmMap(props: Props) {
  return <FarmMapClient {...props} />;
}
