'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Search } from 'lucide-react';

interface DistrictPriceItem {
  districtId: string;
  districtNameBn: string;
  districtNameEn: string;
  division: string;
  pricePerKg: number;
  date: string;
}

const CROPS = [
  { slug: 'potato', nameBn: 'আলু', icon: '🥔' },
  { slug: 'rice', nameBn: 'চাল/ধান', icon: '🌾' },
  { slug: 'onion', nameBn: 'পেঁয়াজ', icon: '🧅' },
  { slug: 'tomato', nameBn: 'টমেটো', icon: '🍅' },
  { slug: 'green-chili', nameBn: 'কাঁচা মরিচ', icon: '🌶️' },
  { slug: 'jute', nameBn: 'পাট', icon: '🌿' },
];

export function DistrictPriceComparison() {
  const [selectedCrop, setSelectedCrop] = useState('potato');
  const [items, setItems] = useState<DistrictPriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/prices/districts?crop=${selectedCrop}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.districts) {
          setItems(data.districts);
        }
        if (active) setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCrop]);

  const top10 = items.slice(0, 10);
  const filtered = items.filter(
    (i) =>
      i.districtNameBn.includes(search) ||
      i.districtNameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CROPS.map((c) => (
          <button
            key={c.slug}
            onClick={() => {
              setLoading(true);
              setSelectedCrop(c.slug);
            }}
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedCrop === c.slug
                ? 'bg-[var(--green)] text-white border-[var(--green)] shadow-sm'
                : 'bg-[var(--card-bg)] text-[var(--ink)] border-[var(--card-border)] hover:bg-[var(--tint)]/50'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.nameBn}</span>
          </button>
        ))}
      </div>

      {/* BarChart: এই ফসলের দাম জেলা অনুযায়ী */}
      <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
          <BarChart3 className="w-5 h-5 text-[var(--green)]" />
          <h3 className="font-bold text-base font-heading text-[var(--ink)]">
            এই ফসলের পাইকারি বাজার দর (জেলা অনুযায়ী)
          </h3>
        </div>

        <div className="w-full h-72">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">
              লোড হচ্ছে...
            </div>
          ) : top10.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">
              কোনো তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                <XAxis
                  dataKey="districtNameBn"
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="৳"
                />
                <Tooltip
                  formatter={(val: number | string | readonly (string | number)[] | undefined) => [
                    `৳${Number(Array.isArray(val) ? val[0] : val ?? 0).toFixed(1)}/কেজি`,
                    'বাজার দর',
                  ]}
                  labelFormatter={(name) => `জেলা: ${name}`}
                />
                <Bar dataKey="pricePerKg" fill="var(--green)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table of all districts */}
      <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-base font-heading text-[var(--ink)]">
            সকল জেলার সর্বশেষ বাজার দর তালিকা
          </h3>
          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="জেলা খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--tint)]/50 text-[var(--ink)] font-bold border-b border-[var(--card-border)] text-[11px]">
              <tr>
                <th className="py-3 px-4">জেলা</th>
                <th className="py-3 px-4">বিভাগ</th>
                <th className="py-3 px-4">দর (প্রতি কেজি)</th>
                <th className="py-3 px-4 text-right">সর্বশেষ আপডেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.map((item) => (
                <tr key={item.districtId} className="hover:bg-[var(--tint)]/20">
                  <td className="py-3 px-4 font-bold text-[var(--ink)]">
                    {item.districtNameBn} ({item.districtNameEn})
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{item.division}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[var(--green)]">
                      ৳{item.pricePerKg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">/কেজি</span>
                  </td>
                  <td className="py-3 px-4 text-right text-[11px] text-[var(--muted)]">
                    {new Date(item.date).toLocaleDateString('bn-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
