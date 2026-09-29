import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { TransportCalculator } from './TransportCalculator';

export const dynamic = 'force-dynamic';

export default async function TransportPage() {
  const [vehicleTypes, districts] = await Promise.all([
    prisma.vehicleType.findMany({
      orderBy: { ratePerKm: 'asc' },
    }),
    prisma.district.findMany({
      orderBy: { nameEn: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোমে ফিরুন</span>
        </Link>
        <h1 className="text-3xl font-extrabold font-heading text-[var(--ink)]">
          পরিবহন ভাড়া ও ফ্রেইট হিসাব
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          হাভারসাইন সূত্র (Haversine formula × ১.৩ রোড ফ্যাক্টর) অনুযায়ী ৬৪ জেলার মধ্যবর্তী দূরত্ব ও অনুমোদিত ভাড়ার তালিকা
        </p>
      </div>

      {/* Live Calculator */}
      <TransportCalculator
        districts={districts.map((d) => ({
          id: d.id,
          nameBn: d.nameBn,
          nameEn: d.nameEn,
          latitude: d.latitude,
          longitude: d.longitude,
        }))}
      />

      {/* Vehicle Types Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-[var(--ink)]">
          অনুমোদিত কৃষি পরিবহন যানের ক্যাটাগরি ও রেট
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicleTypes.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--tint)] text-[var(--green)] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-heading text-[var(--ink)]">
                {v.nameBn}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                সর্বোচ্চ ধারণক্ষমতা: {Number(v.maxWeightKg).toLocaleString()} কেজি
              </p>
              <div className="pt-2 border-t border-[var(--card-border)] flex items-baseline gap-1">
                <span className="text-2xl font-black font-heading text-[var(--green)]">
                  ৳{Number(v.ratePerKm)}
                </span>
                <span className="text-xs text-[var(--muted)]">/কিলোমিটার</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
