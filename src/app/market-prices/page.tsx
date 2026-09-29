import React from 'react';
import { MarketPricePanel } from '@/components/home/MarketPricePanel';
import { DistrictPriceComparison } from '@/components/prices/DistrictPriceComparison';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarketPricesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোমে ফিরুন</span>
        </Link>
        <h1 className="text-3xl font-extrabold font-heading text-[var(--ink)]">
          কৃষি বাজার দর ও ট্রেন্ড বিশ্লেষণ
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          বাংলাদেশের ৬৪ জেলার কৃষি ফসলের ৩০ দিনের ঐতিহাসিক দর এবং জেলাভিত্তিক তুলনামূলক পরিসংখ্যান
        </p>
      </div>

      {/* 1. 30-Day Line/Area Chart Panel */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
          ফসলভিত্তিক ঐতিহাসিক মূল্য রেখাচিত্র
        </h2>
        <div className="max-w-5xl">
          <MarketPricePanel />
        </div>
      </div>

      {/* 2. District Comparison Bar Chart & Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
          জেলাওয়ারী বর্তমান বাজার দর তুলনা
        </h2>
        <DistrictPriceComparison />
      </div>
    </div>
  );
}
