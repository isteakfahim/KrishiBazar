'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart } from '@/lib/cart/CartContext';
import { FarmMap } from '@/components/map/FarmMap';
import { calculateTransportQuote } from '@/lib/transport';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  MapPin,
  Tractor,
  Calendar,
  CheckCircle2,
  Phone,
  Truck,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
  latitude: number;
  longitude: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    nameBn: string;
    nameEn: string;
    descriptionBn: string | null;
    descriptionEn: string | null;
    pricePerKg: number;
    quantityAvailable: number;
    unit: string;
    minimumOrderQty: number;
    expectedHarvestDate: string | null;
    imageUrl: string | null;
    category: {
      id: string;
      nameBn: string;
      nameEn: string;
      icon: string | null;
    };
    district: {
      id: string;
      nameBn: string;
      nameEn: string;
      latitude: number;
      longitude: number;
    };
    farmerProfile: {
      id: string;
      fullName: string;
      phone: string;
      bio: string | null;
      district: {
        nameBn: string;
        nameEn: string;
      };
    };
    farm: {
      id: string;
      name: string;
      landSize: number;
      landUnit: string;
      mainCrops: string | null;
      latitude: number | null;
      longitude: number | null;
      description: string | null;
    } | null;
  };
  districts: DistrictOption[];
  priceHistory: { date: string; price: number }[];
}

export function ProductDetailClient({ product, districts, priceHistory }: ProductDetailProps) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { addItem, buyerDistrictId, setBuyerDistrictId } = useCart();

  // Quantity state
  const [quantity, setQuantity] = useState<number>(product.minimumOrderQty || 1);
  const [added, setAdded] = useState<boolean>(false);

  // Delivery destination district state
  const defaultDestId = buyerDistrictId || districts.find((d) => d.nameEn === 'Dhaka')?.id || districts[0]?.id || '';
  const [selectedDestDistrictId, setSelectedDestDistrictId] = useState<string>(defaultDestId);

  const selectedDestDistrict = useMemo(() => {
    return districts.find((d) => d.id === selectedDestDistrictId) || districts[0];
  }, [districts, selectedDestDistrictId]);

  // Farm origin coordinates (fallback to district center)
  const originLat = product.farm?.latitude ?? product.district.latitude;
  const originLon = product.farm?.longitude ?? product.district.longitude;

  // Transport calculation
  const transportEstimate = useMemo(() => {
    if (!selectedDestDistrict) return null;
    return calculateTransportQuote(
      originLat,
      originLon,
      selectedDestDistrict.latitude,
      selectedDestDistrict.longitude,
      quantity
    );
  }, [originLat, originLon, selectedDestDistrict, quantity]);

  // Market average & difference calculation
  const marketAvg = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return product.pricePerKg;
    const sum = priceHistory.reduce((acc, p) => acc + p.price, 0);
    return Math.round((sum / priceHistory.length) * 10) / 10;
  }, [priceHistory, product.pricePerKg]);

  const diffPercent = useMemo(() => {
    if (marketAvg === 0) return 0;
    return Math.round(((product.pricePerKg - marketAvg) / marketAvg) * 100);
  }, [product.pricePerKg, marketAvg]);

  // Quantity adjustments
  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < product.minimumOrderQty) return product.minimumOrderQty;
      if (next > product.quantityAvailable) return product.quantityAvailable;
      return next;
    });
  };

  const handleDestinationChange = (distId: string) => {
    setSelectedDestDistrictId(distId);
    setBuyerDistrictId(distId);
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      nameBn: product.nameBn,
      nameEn: product.nameEn,
      pricePerKg: product.pricePerKg,
      quantity,
      minimumOrderQty: product.minimumOrderQty,
      availableStock: product.quantityAvailable,
      unit: product.unit,
      imageUrl: product.imageUrl,
      farmerProfileId: product.farmerProfile.id,
      farmerName: product.farmerProfile.fullName,
      farmName: product.farm?.name || 'Farm',
      farmDistrictId: product.district.id,
      farmDistrictNameBn: product.district.nameBn,
      farmDistrictNameEn: product.district.nameEn,
      farmLatitude: originLat,
      farmLongitude: originLon,
      expectedHarvestDate: product.expectedHarvestDate,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const subtotal = quantity * product.pricePerKg;
  const estimatedFreight = transportEstimate?.estimatedCost || 0;
  const grandTotal = subtotal + estimatedFreight;
  const isPreOrder = Boolean(product.expectedHarvestDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--green)]">
          {t.common.home}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[var(--green)]">
          {t.common.browseProducts}
        </Link>
        <span>/</span>
        <span className="text-[var(--ink)] font-semibold truncate max-w-xs">
          {language === 'bn' ? product.nameBn : product.nameEn}
        </span>
      </nav>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visuals, Farm details, Market Chart, Description (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-[var(--tint)] overflow-hidden border border-[var(--card-border)] shadow-sm">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={language === 'bn' ? product.nameBn : product.nameEn}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-7xl text-[var(--green)]">
                <span>{product.category.icon || '🌾'}</span>
              </div>
            )}

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md text-xs font-bold text-[var(--ink)] shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
                <span>{language === 'bn' ? product.district.nameBn : product.district.nameEn}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--tint)]/90 backdrop-blur-md text-xs font-bold text-[var(--green)] border border-[var(--card-border)] shadow-sm">
                <span>{product.category.icon}</span>
                <span>{language === 'bn' ? product.category.nameBn : product.category.nameEn}</span>
              </span>
            </div>

            {isPreOrder && (
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {language === 'bn' ? 'আগাম বুকিং (তোলার তারিখ: ' : 'Advance Listing (Harvest: '}
                  {product.expectedHarvestDate?.substring(0, 10)}
                  {')'}
                </span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
              {language === 'bn' ? product.nameBn : product.nameEn}
            </h1>
            <p className="text-sm text-[var(--ink)]/80 leading-relaxed">
              {language === 'bn'
                ? product.descriptionBn ||
                  'কৃষকের নিজস্ব খামারে প্রাকৃতিক পরিচর্যায় উৎপাদিত টাটকা ও মানসম্মত ফসল।'
                : product.descriptionEn ||
                  'Naturally grown produce harvested directly from verified local farms.'}
            </p>
          </div>

          {/* Farmer & Farm Profile Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                    {language === 'bn' ? 'কৃষক ও খামারের তথ্য' : 'Farmer & Farm Verification'}
                  </h3>
                  <span className="text-[11px] text-[var(--muted)]">
                    {language === 'bn' ? 'নিবন্ধিত কৃষি উৎপাদক' : 'Registered Agricultural Producer'}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--muted)] block">{language === 'bn' ? 'কৃষকের নাম' : 'Farmer Name'}</span>
                <span className="font-bold text-[var(--ink)] text-sm">{product.farmerProfile.fullName}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">{language === 'bn' ? 'খামারের নাম' : 'Farm Name'}</span>
                <span className="font-bold text-[var(--ink)] text-sm">
                  {product.farm?.name || (language === 'bn' ? 'কৃষকের খামার' : 'Family Farm')}
                </span>
              </div>
              {product.farm && (
                <div>
                  <span className="text-[var(--muted)] block">{language === 'bn' ? 'জমির পরিমাণ' : 'Land Size'}</span>
                  <span className="font-bold text-[var(--ink)]">
                    {product.farm.landSize} {product.farm.landUnit}
                  </span>
                </div>
              )}
              {product.farm?.mainCrops && (
                <div>
                  <span className="text-[var(--muted)] block">{language === 'bn' ? 'প্রধান ফসল' : 'Main Crops'}</span>
                  <span className="font-bold text-[var(--ink)]">{product.farm.mainCrops}</span>
                </div>
              )}
            </div>

            {/* Farmer Phone Call */}
            <div className="pt-2 flex items-center justify-between">
              <a
                href={`tel:${product.farmerProfile.phone}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--tint)] text-[var(--green)] hover:bg-[var(--tint)]/80 text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কৃষককে কল করুন: ' : 'Call Farmer: '}{product.farmerProfile.phone}</span>
              </a>
            </div>

            {/* Farm Map Pin */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
                  {language === 'bn' ? 'খামারের ভৌগোলিক অবস্থান' : 'Farm Geo-Location'}
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  {language === 'bn' ? 'ওপেনস্ট্রিটম্যাপ লাইভ পিন' : 'OpenStreetMap Live Pin'}
                </span>
              </div>
              <FarmMap
                latitude={originLat}
                longitude={originLon}
                farmName={product.farm?.name || product.farmerProfile.fullName}
                districtName={language === 'bn' ? product.district.nameBn : product.district.nameEn}
              />
            </div>
          </div>

          {/* 30-Day Historical Market Price Benchmark Chart */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--card-border)]">
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>{language === 'bn' ? 'বিগত ৩০ দিনের বাজার দর ও কৃষকের দর' : '30-Day Market Trend vs Farmer Price'}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {language === 'bn'
                    ? `${product.district.nameBn} জেলার পাইকারি বাজার দরের সাথে এই ফসলের তুলনা`
                    : `Comparison with wholesale market rates in ${product.district.nameEn}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--tint)] text-[var(--green)] font-bold">
                  {language === 'bn' ? 'বাজার গড়: ' : 'Avg: '}৳{marketAvg}/কেজি
                </span>
              </div>
            </div>

            {priceHistory && priceHistory.length > 0 ? (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="detailMarketGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#17553A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#17553A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      stroke="var(--muted)"
                      fontSize={11}
                      tickFormatter={(val) => val.substring(5)}
                    />
                    <YAxis tickLine={false} stroke="var(--muted)" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      formatter={(val: number | string | readonly (string | number)[] | undefined) => [
                        `৳${Number(Array.isArray(val) ? val[0] : val ?? 0).toFixed(1)} / কেজি`,
                        language === 'bn' ? 'পাইকারি বাজার দর' : 'Market Wholesale Rate',
                      ]}
                      labelFormatter={(lbl) => `${language === 'bn' ? 'তারিখ' : 'Date'}: ${lbl}`}
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      name="Market Price"
                      stroke="#17553A"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#detailMarketGrad)"
                    />
                    <ReferenceLine
                      y={product.pricePerKg}
                      stroke="#C98A06"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `${language === 'bn' ? 'কৃষকের দর: ৳' : 'Farmer: ৳'}${product.pricePerKg}`,
                        fill: '#C98A06',
                        fontSize: 11,
                        position: 'top',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-[var(--muted)]">
                {language === 'bn' ? 'এই জেলার পর্যাপ্ত মূল্য তথ্য সংগৃহীত হয়নি।' : 'No historical price data recorded.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Transport Quote & Add to Cart (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-6">
            {/* Price Header */}
            <div>
              <span className="text-xs text-[var(--muted)] block font-medium">
                {language === 'bn' ? 'কৃষকের নির্ধারিত দর' : "Farmer's Listed Price"}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black font-heading text-[var(--green)]">
                  ৳{product.pricePerKg.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-[var(--muted)]">
                  / {product.unit}
                </span>
              </div>

              {/* Price comparison chip */}
              <div className="mt-2.5">
                {diffPercent < 0 ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `বাজার গড়ের চেয়ে ${Math.abs(diffPercent)}% সাশ্রয়ী`
                        : `${Math.abs(diffPercent)}% below market avg`}
                    </span>
                  </span>
                ) : diffPercent > 0 ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `বাজার গড়ের চেয়ে ${diffPercent}% বেশি`
                        : `${diffPercent}% above market avg`}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--tint)] text-[var(--green)]">
                    {language === 'bn' ? 'বাজার দরের সাথে সামঞ্জস্যপূর্ণ' : 'Aligned with market average'}
                  </span>
                )}
              </div>
            </div>

            {/* Stock & Minimum Order */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)] text-xs">
              <div>
                <span className="text-[var(--muted)] block">{language === 'bn' ? 'মজুদ পরিমাণ' : 'Available Stock'}</span>
                <span className="font-extrabold text-[var(--ink)] text-sm">
                  {product.quantityAvailable.toLocaleString()} {product.unit}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">{language === 'bn' ? 'নূন্যতম ক্রয়' : 'Min Order'}</span>
                <span className="font-extrabold text-[var(--ink)] text-sm">
                  {product.minimumOrderQty} {product.unit}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--ink)] block">
                {language === 'bn' ? 'ক্রয়ের পরিমাণ নির্ধারণ করুন' : 'Select Order Quantity'}
              </label>
              <div className="flex items-center justify-between border border-[var(--card-border)] rounded-2xl p-1.5 bg-[var(--bg)]">
                <button
                  onClick={() => handleQtyChange(-10)}
                  disabled={quantity <= product.minimumOrderQty}
                  className="w-10 h-10 rounded-xl bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--tint)] disabled:opacity-40 flex items-center justify-center font-bold transition-colors shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-lg font-black font-heading text-[var(--ink)]">
                    {quantity}
                  </span>
                  <span className="text-xs text-[var(--muted)] ml-1 font-semibold">{product.unit}</span>
                </div>
                <button
                  onClick={() => handleQtyChange(10)}
                  disabled={quantity >= product.quantityAvailable}
                  className="w-10 h-10 rounded-xl bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--tint)] disabled:opacity-40 flex items-center justify-center font-bold transition-colors shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Haversine Live Transport Estimator Widget */}
            <div className="p-4 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--green)] flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {language === 'bn' ? 'পরিবহন ভাড়া কোটেশন' : 'Transport Freight Quote'}
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  {language === 'bn' ? 'হেভারসাইন সূত্র' : 'Haversine Model'}
                </span>
              </div>

              {/* Destination District Select */}
              <div>
                <label className="text-[11px] text-[var(--muted)] block mb-1">
                  {language === 'bn' ? 'আপনার ডেলিভারি জেলা' : 'Your Delivery District'}
                </label>
                <select
                  value={selectedDestDistrictId}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'bn' ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Breakdown */}
              {transportEstimate && (
                <div className="space-y-1.5 text-xs text-[var(--muted)] pt-1 border-t border-[var(--card-border)]">
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'সড়ক দূরত্ব (আনুমানিক)' : 'Road Distance (approx)'}:</span>
                    <span className="font-bold text-[var(--ink)]">{transportEstimate.roadDistanceKm} কি.মি.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'প্রস্তাবিত যানবাহন' : 'Recommended Vehicle'}:</span>
                    <span className="font-bold text-[var(--green)]">
                      {language === 'bn' ? transportEstimate.vehicleNameBn : transportEstimate.vehicleNameEn}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-[var(--card-border)]">
                    <span className="font-bold text-[var(--ink)]">{language === 'bn' ? 'আনুমানিক ভাড়া' : 'Est. Freight'}:</span>
                    <span className="font-black text-[var(--green)]">৳{transportEstimate.estimatedCost}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Cost Summary */}
            <div className="pt-2 border-t border-[var(--card-border)] space-y-2">
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{language === 'bn' ? 'ফসলের দাম' : 'Produce Cost'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{subtotal.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{language === 'bn' ? 'পরিবহন ভাড়া' : 'Transport'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{estimatedFreight}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--card-border)]">
                <span className="text-sm font-bold text-[var(--ink)]">
                  {language === 'bn' ? 'সর্বমোট আনুমানিক' : 'Grand Total'}:
                </span>
                <span className="text-2xl font-black font-heading text-[var(--green)]">
                  ৳{grandTotal.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--green)] text-white hover:bg-[var(--green-hover)]'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-4 rounded-2xl text-sm font-bold bg-[var(--tint)] text-[var(--green)] hover:bg-[var(--tint)]/80 flex items-center justify-center gap-2 transition-colors border border-[var(--card-border)]"
              >
                <Package className="w-4 h-4" />
                <span>{language === 'bn' ? 'কার্ট দেখুন ও অর্ডার করুন' : 'View Cart & Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
