'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordDailyPriceAction, bulkUploadPricesAction, CSVPriceRow } from '../actions';
import {
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Loader2,
  Table as TableIcon,
} from 'lucide-react';
import { PriceSource } from '@prisma/client';

interface CategoryOption {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon?: string | null;
}

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
}

interface PriceHistoryEntry {
  id: string;
  category: { nameBn: string; nameEn: string; icon?: string | null };
  district: { nameBn: string; nameEn: string };
  pricePerKg: number;
  date: string;
  source: PriceSource;
  isDemo: boolean;
}

interface Props {
  categories: CategoryOption[];
  districts: DistrictOption[];
  recentEntries: PriceHistoryEntry[];
}

export function PriceEntryManager({ categories, districts, recentEntries }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');

  // Single Entry Form state
  const todayStr = new Date().toISOString().substring(0, 10);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [districtId, setDistrictId] = useState(districts[0]?.id || '');
  const [dateStr, setDateStr] = useState(todayStr);
  const [pricePerKg, setPricePerKg] = useState('');
  const source: PriceSource = 'ADMIN';

  // Deviation Warning state
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [overrideDeviation, setOverrideDeviation] = useState(false);

  const [singleLoading, setSingleLoading] = useState(false);
  const [singleSuccess, setSingleSuccess] = useState<string | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // CSV Bulk Upload state
  const [csvText, setCsvText] = useState<string>(
    `date,category,district,price\n${todayStr},potato,Dhaka,42.5\n${todayStr},onion,Bogura,68.0\n${todayStr},tomato,Dinajpur,35.0`
  );
  const [parsedRows, setParsedRows] = useState<CSVPriceRow[] | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Handle Single Price Submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleLoading(true);
    setSingleError(null);
    setSingleSuccess(null);

    const priceNum = parseFloat(pricePerKg);
    if (isNaN(priceNum) || priceNum <= 0) {
      setSingleError('অনুগ্রহ করে সঠিক মূল্য লিখুন।');
      setSingleLoading(false);
      return;
    }

    const res = await recordDailyPriceAction({
      categoryId,
      districtId,
      dateStr,
      pricePerKg: priceNum,
      source,
      overrideDeviation,
    });

    if (!res.success) {
      if (res.needsConfirmation) {
        setWarningMessage(res.message || 'দাম বিগত দিনের চেয়ে ৫০% এর বেশি পরিবর্তিত হয়েছে।');
      } else {
        setSingleError(res.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
      setSingleLoading(false);
      return;
    }

    setWarningMessage(null);
    setOverrideDeviation(false);
    setPricePerKg('');
    setSingleSuccess('বাজার দর সফলভাবে রেকর্ড করা হয়েছে!');
    setSingleLoading(false);
    router.refresh();
  };

  // Handle CSV Parse
  const handleParseCsv = () => {
    setCsvError(null);
    setCsvSuccess(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setCsvError('অনুগ্রহ করে অন্তত ১টি ডাটা সারি সহ CSV পেস্ট করুন।');
        return;
      }

      const rows: CSVPriceRow[] = [];
      // Skip header if line 0 contains date or category
      const startIndex = lines[0].toLowerCase().includes('category') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 4) {
          const [date, category, district, price] = parts;
          const numPrice = parseFloat(price);
          if (!isNaN(numPrice)) {
            rows.push({
              date,
              category,
              district,
              price: numPrice,
            });
          }
        }
      }

      if (rows.length === 0) {
        setCsvError('কোনো সঠিক সারি খুঁজে পাওয়া যায়নি। ফরম্যাট: date,category,district,price');
        return;
      }

      setParsedRows(rows);
    } catch {
      setCsvError('CSV পার্স করতে সমস্যা হয়েছে।');
    }
  };

  // Handle CSV Commit to Database
  const handleCommitCsv = async () => {
    if (!parsedRows || parsedRows.length === 0) return;

    setCsvLoading(true);
    setCsvError(null);
    setCsvSuccess(null);

    const res = await bulkUploadPricesAction(parsedRows);
    if (!res.success) {
      setCsvError(res.error || 'CSV সংরক্ষণ ব্যর্থ হয়েছে।');
      setCsvLoading(false);
      return;
    }

    setCsvSuccess(`সফলভাবে ${res.insertedCount}টি দর রেকর্ড ডাটাবেজে সংরক্ষণ করা হয়েছে! ${res.errorCount ? `(${res.errorCount}টি ত্রুটিযুক্ত সারি বাদ দেওয়া হয়েছে)` : ''}`);
    setParsedRows(null);
    setCsvLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Switcher: Single vs CSV */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('single')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'single'
              ? 'bg-[var(--green)] text-white shadow-xs'
              : 'text-[var(--ink)]/80 hover:bg-[var(--tint)]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>একক দৈনিক দর এন্ট্রি</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'csv'
              ? 'bg-[var(--green)] text-white shadow-xs'
              : 'text-[var(--ink)]/80 hover:bg-[var(--tint)]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>সিএসভি (CSV) বাল্ক আপলোড</span>
        </button>
      </div>

      {/* Tab 1: Single Daily Entry */}
      {activeTab === 'single' && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-3 border-b border-[var(--card-border)]">
            <h3 className="font-heading font-bold text-lg text-[var(--ink)]">
              জেলা ভিত্তিক দৈনিক বাজার পাইকারি দর অন্তর্ভুক্তি
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              কৃষি বিপণন অধিদপ্তরের দৈনিক দর অথবা সরাসরি জেলা মোকাম যাচাইকৃত পাইকারি দর এন্ট্রি করুন।
            </p>
          </div>

          {singleSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{singleSuccess}</span>
            </div>
          )}

          {singleError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{singleError}</span>
            </div>
          )}

          {/* >50% Deviation Warning Banner */}
          {warningMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-amber-900 dark:text-amber-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">বাজার দর বিচ্যুতি সতর্কতা (&gt;৫০% পরিবর্তন)</div>
                  <div>{warningMessage}</div>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/50 cursor-pointer font-bold select-none">
                <input
                  type="checkbox"
                  checked={overrideDeviation}
                  onChange={(e) => setOverrideDeviation(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>আমি নিশ্চিত যে এই মূল্য তথ্যটি যাচাইকৃত ও সঠিক।</span>
              </label>
            </div>
          )}

          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">ফসল ক্যাটাগরি</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '🌾'} {c.nameBn} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">জেলা</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameBn} ({d.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">তারিখ</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">দর (টাকা / কেজি)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 45.0"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={singleLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm disabled:opacity-50"
              >
                {singleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{warningMessage && overrideDeviation ? 'সম্মতিসহ সংরক্ষণ করুন' : 'বাজার দর সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: CSV Bulk Upload */}
      {activeTab === 'csv' && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-3 border-b border-[var(--card-border)]">
            <h3 className="font-heading font-bold text-lg text-[var(--ink)]">
              সিএসভি (CSV) ডেটা বাল্ক আপলোড
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              একাধিক জেলা ও ফসলের বাজার দর একসাথে আপলোড করুন। ফরম্যাট: <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded font-mono">date,category,district,price</code>
            </p>
          </div>

          {csvSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{csvSuccess}</span>
            </div>
          )}

          {csvError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{csvError}</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--ink)] block">
              সিএসভি কনটেন্ট পেস্ট করুন (বা সম্পাদনা করুন):
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-mono text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleParseCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--tint)] text-[var(--green)] text-xs font-bold hover:bg-[var(--tint)]/80 transition-colors"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>যাচাই ও প্রিভিউ দেখুন</span>
              </button>
            </div>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows && (
            <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ink)]">
                  যাচাইকৃত সারি: {parsedRows.length} টি
                </span>

                <button
                  type="button"
                  onClick={handleCommitCsv}
                  disabled={csvLoading}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] disabled:opacity-50 shadow-sm transition-all"
                >
                  {csvLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>ডাটাবেজে সেভ করুন</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-[var(--card-border)] rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg)] sticky top-0 border-b border-[var(--card-border)] text-[var(--muted)]">
                    <tr>
                      <th className="py-2 px-3">তারিখ</th>
                      <th className="py-2 px-3">ফসল (Category)</th>
                      <th className="py-2 px-3">জেলা (District)</th>
                      <th className="py-2 px-3">দর (৳/কেজি)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg)]">
                        <td className="py-2 px-3 font-mono">{r.date}</td>
                        <td className="py-2 px-3 font-semibold">{r.category}</td>
                        <td className="py-2 px-3">{r.district}</td>
                        <td className="py-2 px-3 font-bold text-[var(--green)]">৳{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent 20 Entries Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <h3 className="font-heading font-bold text-base text-[var(--ink)]">
            সাম্প্রতিক অন্তর্ভুক্ত বাজার দর
          </h3>
          <span className="text-xs text-[var(--muted)]">সর্বশেষ ২০টি রেকর্ড</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3">ফসল</th>
                <th className="py-2.5 px-3">জেলা</th>
                <th className="py-2.5 px-3">দর (টাকা/কেজি)</th>
                <th className="py-2.5 px-3">উৎস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {recentEntries.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--bg)] transition-colors">
                  <td className="py-2.5 px-3 font-mono">{e.date}</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--ink)]">
                    {e.category.icon} {e.category.nameBn}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--muted)]">{e.district.nameBn}</td>
                  <td className="py-2.5 px-3 font-black text-[var(--green)]">৳{e.pricePerKg.toFixed(1)}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--tint)] text-[var(--green)]">
                      {e.source}
                    </span>
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
