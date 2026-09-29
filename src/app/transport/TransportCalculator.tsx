'use client';

import React, { useState } from 'react';
import { Truck, MapPin, Calculator, Info } from 'lucide-react';
import { calculateTransportQuote, TransportEstimate } from '@/lib/transport';

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
  latitude: number;
  longitude: number;
}

export function TransportCalculator({ districts }: { districts: DistrictOption[] }) {
  const [fromId, setFromId] = useState(
    districts.find((d) => d.nameEn === 'Bogura')?.id || districts[0]?.id || ''
  );
  const [toId, setToId] = useState(
    districts.find((d) => d.nameEn === 'Dhaka')?.id || districts[1]?.id || ''
  );
  const [weightKg, setWeightKg] = useState('2000');

  const fromDist = districts.find((d) => d.id === fromId);
  const toDist = districts.find((d) => d.id === toId);

  let quote: TransportEstimate | null = null;
  if (fromDist && toDist) {
    quote = calculateTransportQuote(
      fromDist.latitude,
      fromDist.longitude,
      toDist.latitude,
      toDist.longitude,
      parseFloat(weightKg) || 100
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
        <div className="w-10 h-10 rounded-2xl bg-[var(--tint)] text-[var(--green)] flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-heading text-[var(--ink)]">
            লাইভ পরিবহন ভাড়া হিসাব ক্যালকুলেটর
          </h2>
          <p className="text-xs text-[var(--muted)]">
            হাভারসাইন দূরত্ব ও অনুমোদিত রোড ফ্যাক্টর (১.৩) অনুযায়ী বাস্তবসম্মত ভাড়া হিসাব
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
            <span>প্রেরক জেলা (খামার) *</span>
          </label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] font-semibold text-[var(--ink)] outline-none"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameBn} ({d.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>গন্তব্য জেলা (ডেলিভারি) *</span>
          </label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] font-semibold text-[var(--ink)] outline-none"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameBn} ({d.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[var(--ink)] flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>মোট ওজন (কেজি) *</span>
          </label>
          <input
            type="number"
            min="10"
            step="50"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] font-bold text-[var(--ink)] outline-none"
          />
        </div>
      </div>

      {quote && (
        <div className="p-6 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-[var(--muted)] block">প্রস্তাবিত পরিবহন যান</span>
              <div className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--green)]" />
                <span>{quote.vehicleNameBn}</span>
              </div>
              <span className="text-[11px] text-[var(--muted)] block">
                সড়ক দূরত্ব: {quote.roadDistanceKm} কিমি (সরাসরি: {quote.distanceKm} কিমি) • দর: ৳{quote.ratePerKm}/কিমি
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-[var(--muted)] block">আনুমানিক মোট ভাড়া</span>
              <div className="text-3xl font-black font-heading text-[var(--green)]">
                ৳{quote.estimatedCost.toLocaleString()}
              </div>
              <span className="text-[10px] text-[var(--muted)] block">
                (নূন্যতম ভাড়া: ৳{quote.minCharge})
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--card-border)] flex items-start gap-2 text-[11px] text-[var(--muted)]">
            <Info className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
            <span>
              এটি একটি আনুমানিক দূরত্বভিত্তিক ভাড়া হিসাব (Haversine Distance × 1.3 Road Factor)। পণ্য অর্ডারের সময় কৃষক ও ক্রেতা উভয়েই এই স্বচ্ছ হিসাব দেখতে পাবেন।
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
