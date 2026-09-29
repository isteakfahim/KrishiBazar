'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createFarmerProduct, updateFarmerProduct } from '../actions';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  Upload,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface FormChartPoint {
  date: string;
  marketPrice: number;
}

interface CategoryOption {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon: string | null;
}

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
}

interface InitialProductData {
  id?: string;
  nameBn: string;
  nameEn: string;
  descriptionBn?: string | null;
  categoryId: string;
  districtId: string;
  pricePerKg: number;
  quantityAvailable: number;
  minimumOrderQty: number;
  isPreOrder?: boolean;
  expectedHarvestDate?: string | null;
  imageUrl?: string | null;
}

export function ProductForm({
  categories,
  districts,
  initialData,
  isEdit = false,
}: {
  categories: CategoryOption[];
  districts: DistrictOption[];
  initialData?: InitialProductData;
  isEdit?: boolean;
}) {
  const router = useRouter();

  // Form state
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [districtId, setDistrictId] = useState(initialData?.districtId || districts[0]?.id || '');
  const [nameBn, setNameBn] = useState(initialData?.nameBn || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [descriptionBn, setDescriptionBn] = useState(initialData?.descriptionBn || '');
  const [pricePerKg, setPricePerKg] = useState(initialData?.pricePerKg?.toString() || '38');
  const [quantityAvailable, setQuantityAvailable] = useState(
    initialData?.quantityAvailable?.toString() || '1000'
  );
  const [minimumOrderQty, setMinimumOrderQty] = useState(
    initialData?.minimumOrderQty?.toString() || '20'
  );
  const [isPreOrder, setIsPreOrder] = useState(Boolean(initialData?.expectedHarvestDate));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    initialData?.expectedHarvestDate ? initialData.expectedHarvestDate.substring(0, 10) : ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Market chart state
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const selectedDistrictObj = districts.find((d) => d.id === districtId);

  const [chartData, setChartData] = useState<FormChartPoint[]>([]);
  const [marketAvgPrice, setMarketAvgPrice] = useState<number>(38);
  const [chartLoading, setChartLoading] = useState(false);

  // Auto-set title suggestion when crop changes if empty
  const handleCategorySelect = (cat: CategoryOption) => {
    setCategoryId(cat.id);
    if (!nameBn) {
      setNameBn(`তাজা ${cat.nameBn}`);
    }
  };

  // Fetch live market data when category or district changes
  useEffect(() => {
    if (!selectedCategoryObj || !selectedDistrictObj) return;

    const controller = new AbortController();

    fetch(
      `/api/prices/chart?crop=${selectedCategoryObj.slug}&district=${selectedDistrictObj.nameEn}&days=30`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setChartData(data.data);
          setMarketAvgPrice(data.currentPrice || 38);
        }
        setChartLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setChartLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [categoryId, districtId, selectedCategoryObj, selectedDistrictObj]);

  const numFarmerPrice = parseFloat(pricePerKg) || 0;
  const priceDiffPercent =
    marketAvgPrice > 0
      ? Math.round(((numFarmerPrice - marketAvgPrice) / marketAvgPrice) * 100 * 10) / 10
      : 0;

  const isDeviationHigh = Math.abs(priceDiffPercent) > 40;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('categoryId', categoryId);
    formData.append('districtId', districtId);
    formData.append('nameBn', nameBn);
    formData.append('nameEn', nameEn || nameBn);
    formData.append('descriptionBn', descriptionBn);
    formData.append('pricePerKg', pricePerKg);
    formData.append('quantityAvailable', quantityAvailable);
    formData.append('minimumOrderQty', minimumOrderQty);
    formData.append('isPreOrder', isPreOrder ? 'true' : 'false');
    if (isPreOrder && expectedHarvestDate) {
      formData.append('expectedHarvestDate', expectedHarvestDate);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEdit && initialData?.id) {
        await updateFarmerProduct(initialData.id, formData);
      } else {
        await createFarmerProduct(formData);
      }
      router.push('/farmer/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ফসল সংরক্ষণে ত্রুটি হয়েছে।');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* FORM: LEFT COLUMN (7 COLS) */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CROP SELECTION */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--green)] text-white text-xs font-bold flex items-center justify-center">
              ১
            </span>
            <h2 className="text-base font-bold font-heading text-[var(--ink)]">
              ফসল ও অবস্থান নির্বাচন
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--ink)] block">
              ফসলের ক্যাটাগরি *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-[var(--green)] bg-[var(--tint)] text-[var(--green)] shadow-xs scale-102'
                        : 'border-[var(--card-border)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--tint)]/40'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon || '🌾'}</span>
                    <span className="text-xs font-bold truncate max-w-full">{cat.nameBn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-[var(--ink)] block">
              উৎপাদন অঞ্চল / জেলা *
            </label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] font-semibold outline-none"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameBn} ({d.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 2: QUANTITY & DETAILS */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--green)] text-white text-xs font-bold flex items-center justify-center">
              ২
            </span>
            <h2 className="text-base font-bold font-heading text-[var(--ink)]">
              বিবরণ, পরিমাণ ও ছবি
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[var(--ink)]">ফসলের নাম (বাংলা) *</label>
              <input
                type="text"
                required
                placeholder="উদা: বগুড়ার ডায়মন্ড আলু"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[var(--ink)]">ইংরেজি নাম (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="e.g. Diamond Potato"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[var(--ink)]">ফসলের গুণগত বৈশিষ্ট্য ও বিবরণ</label>
            <textarea
              rows={3}
              placeholder="কীটনাশকমুক্ত, সতেজ, সরাসরি ক্ষেত থেকে উত্তোলিত..."
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[var(--ink)]">মোট মজুদ পরিমাণ (কেজি) *</label>
              <input
                type="number"
                required
                min="1"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[var(--ink)]">নূন্যতম অর্ডার পরিমাণ (কেজি) *</label>
              <input
                type="number"
                required
                min="1"
                value={minimumOrderQty}
                onChange={(e) => setMinimumOrderQty(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] outline-none"
              />
            </div>
          </div>

          {/* Photo upload */}
          <div className="space-y-2 text-xs pt-2">
            <label className="font-semibold text-[var(--ink)] block">ফসলের বাস্তব ছবি</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[var(--card-border)] shrink-0">
                  <Image src={imagePreview} alt="Preview" width={80} height={80} unoptimized className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer border-2 border-dashed border-[var(--card-border)] hover:border-[var(--green)] p-4 rounded-2xl flex flex-col items-center gap-1 text-[var(--muted)] flex-1">
                <Upload className="w-5 h-5 text-[var(--green)]" />
                <span className="font-bold text-[var(--ink)]">ছবি নির্বাচন করুন</span>
                <span className="text-[10px]">JPEG, PNG, WEBP (সর্বোচ্চ ৫ MB)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* STEP 3: PRICING & HARVEST STATUS */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--green)] text-white text-xs font-bold flex items-center justify-center">
              ৩
            </span>
            <h2 className="text-base font-bold font-heading text-[var(--ink)]">
              মূল্য নির্ধারণ ও উত্তোলন সময়
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[var(--ink)]">আপনার বিক্রয় মূল্য (প্রতি কেজি) *</label>
              {/* Suggested price button */}
              <button
                type="button"
                onClick={() => setPricePerKg(marketAvgPrice.toFixed(1))}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--green)] font-bold bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--green)]/20"
              >
                <Sparkles className="w-3 h-3" />
                <span>প্রস্তাবিত বাজার দর: ৳{marketAvgPrice.toFixed(1)}</span>
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">
                ৳
              </span>
              <input
                type="number"
                step="0.5"
                required
                min="1"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full pl-8 pr-12 py-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-sm font-bold text-[var(--ink)] outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
                /কেজি
              </span>
            </div>

            {/* Price comparison chip */}
            <div className="pt-1 flex items-center gap-2">
              {priceDiffPercent > 0 ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  বাজারের গড় দরের চেয়ে {priceDiffPercent}% বেশি
                </span>
              ) : priceDiffPercent < 0 ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-900 border border-green-200">
                  বাজারের গড় দরের চেয়ে {Math.abs(priceDiffPercent)}% সাশ্রয়ী
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900">
                  বাজারের গড় দরের সমান
                </span>
              )}
            </div>

            {/* High deviation warning banner */}
            {isDeviationHigh && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  সতর্কতা: আপনার নির্ধারিত দর বর্তমান বাজার গড় দরের চেয়ে ৪০% এর বেশি বিচ্যুত। নিশ্চিত হয়ে মূল্য নির্ধারণ করুন।
                </span>
              </div>
            )}
          </div>

          {/* Pre-order / Advance listing toggle */}
          <div className="pt-3 border-t border-[var(--card-border)] space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPreOrder}
                onChange={(e) => setIsPreOrder(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--green)] accent-[var(--green)] cursor-pointer"
              />
              <span className="font-bold text-[var(--ink)]">
                এখনো কাটা বা তোলা হয়নি (আগাম বুকিং / প্রি-অর্ডার)
              </span>
            </label>

            {isPreOrder && (
              <div className="p-3 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] space-y-1">
                <label className="font-semibold text-[var(--ink)] block">
                  সম্ভাব্য ফসল তোলার তারিখ (Expected Harvest Date) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required={isPreOrder}
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] outline-none font-semibold text-[var(--ink)]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-2xl border border-[var(--card-border)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--tint)]"
          >
            বাতিল করুন
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-2xl bg-[var(--green)] text-white text-xs sm:text-sm font-bold hover:bg-[var(--green-hover)] transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'পরিবর্তন সংরক্ষণ করুন' : 'ফসল প্রকাশ করুন'}
          </button>
        </div>
      </form>

      {/* BENCHMARK CHART: RIGHT COLUMN (5 COLS) */}
      <div className="lg:col-span-5 sticky top-20 space-y-4">
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[var(--green)] uppercase tracking-wider block">
                লাইভ বাজার দর চার্ট (৩০ দিন)
              </span>
              <h3 className="text-base font-bold font-heading text-[var(--ink)]">
                {selectedCategoryObj?.icon} {selectedCategoryObj?.nameBn} • {selectedDistrictObj?.nameBn}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              ডেমো দর
            </span>
          </div>

          {/* Quick stats comparison bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--muted)] block">বাজার গড় দর</span>
              <span className="text-lg font-black font-heading text-[var(--ink)]">
                ৳{marketAvgPrice.toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--muted)]">/কেজি</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--muted)] block">আপনার দর লাইন</span>
              <span className="text-lg font-black font-heading text-[var(--farmer-price)]">
                ৳{numFarmerPrice.toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--muted)]">/কেজি</span>
            </div>
          </div>

          {/* Mini Recharts AreaChart with dynamic dashed farmer-price reference line */}
          <div className="w-full h-64">
            {chartLoading ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)] text-center p-4">
                এই জেলায় এখনো বাজার দর তথ্য নেই। আপনি স্বাধীনভাবে যেকোনো দর নির্ধারণ করতে পারেন।
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="farmerFormGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} unit="৳" />
                  <Tooltip />
                  {/* Dynamic farmer price line moving as farmer types */}
                  <ReferenceLine
                    y={numFarmerPrice}
                    stroke="var(--farmer-price)"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `আপনার দর: ৳${numFarmerPrice.toFixed(1)}`,
                      position: 'insideTopRight',
                      fill: 'var(--farmer-price)',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketPrice"
                    stroke="var(--green)"
                    strokeWidth={2}
                    fill="url(#farmerFormGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] flex items-start gap-2 text-[11px] text-[var(--muted)]">
            <Info className="w-3.5 h-3.5 text-[var(--green)] shrink-0 mt-0.5" />
            <span>
              হলুদ ড্যাশ লাইনটি আপনার নির্ধারিত বিক্রয়মূল্য নির্দেশ করছে। এটি দেখে বাজার গড় দরের চেয়ে সামঞ্জস্যপূর্ণ মূল্যে ফসল বিক্রি করুন।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
