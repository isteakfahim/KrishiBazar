'use client';

import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  Tag,
} from 'lucide-react';

interface ChartPoint {
  rawDate: string;
  date: string;
  marketPrice: number;
  farmerPrice: number;
}

interface PriceDataResponse {
  crop: { id: string; nameEn: string; nameBn: string; slug: string };
  district: { id: string; nameEn: string; nameBn: string };
  farmerPrice: number;
  currentPrice: number;
  changePercent: number;
  diffFromFarmer: number;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  data: ChartPoint[];
  isDemo: boolean;
}

const AVAILABLE_CROPS = [
  { slug: 'potato', nameBn: 'আলু', nameEn: 'Potato', icon: '🥔' },
  { slug: 'rice', nameBn: 'চাল/ধান', nameEn: 'Rice', icon: '🌾' },
  { slug: 'onion', nameBn: 'পেঁয়াজ', nameEn: 'Onion', icon: '🧅' },
  { slug: 'tomato', nameBn: 'টমেটো', nameEn: 'Tomato', icon: '🍅' },
  { slug: 'green-chili', nameBn: 'কাঁচা মরিচ', nameEn: 'Green Chili', icon: '🌶️' },
  { slug: 'jute', nameBn: 'পাট', nameEn: 'Jute', icon: '🌿' },
];

const AVAILABLE_DISTRICTS = [
  { nameEn: 'Bogura', nameBn: 'বগুড়া' },
  { nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { nameEn: 'Jashore', nameBn: 'যশোর' },
  { nameEn: 'Cumilla', nameBn: 'কুমিল্লা' },
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
  { nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  label?: string;
  language: 'bn' | 'en';
  farmerPrice: number;
}

function MarketChartTooltip({ active, payload, language, farmerPrice }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-xl shadow-lg text-xs space-y-1 z-50">
        <div className="font-semibold text-[var(--muted)] flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dataPoint.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--green)]"></span>
          <span className="text-[var(--ink)] font-medium">
            {language === 'bn' ? 'বাজার গড় দর:' : 'Market Price:'}
          </span>
          <span className="font-bold text-[var(--ink)]">
            ৳{dataPoint.marketPrice.toFixed(1)}/কেজি
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--farmer-price)]"></span>
          <span className="text-[var(--ink)] font-medium">
            {language === 'bn' ? 'কৃষকের মূল্য:' : "Farmer's Price:"}
          </span>
          <span className="font-bold text-[var(--farmer-price)]">
            ৳{farmerPrice.toFixed(1)}/কেজি
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function MarketPricePanel() {
  const { language, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('potato');
  const [selectedDistrict, setSelectedDistrict] = useState('Bogura');
  const [rangeDays, setRangeDays] = useState<7 | 30>(30);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceDataResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Fetch data asynchronously without synchronous local setState in the effect body
    const controller = new AbortController();

    fetch(`/api/prices/chart?crop=${selectedCrop}&district=${selectedDistrict}&days=${rangeDays}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: PriceDataResponse) => {
        if (isMounted) {
          setPriceData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching price data:', err);
          if (isMounted) setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCrop, selectedDistrict, rangeDays]);

  const chartData = priceData?.data || [];
  const farmerPrice = priceData?.farmerPrice ?? 38;
  const currentPrice = priceData?.currentPrice ?? 37;
  const changePercent = priceData?.changePercent ?? 0;
  const diffFromFarmer = priceData?.diffFromFarmer ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-7 shadow-sm transition-colors duration-200"
    >
      {/* Header bar with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--tint)] text-[var(--green)] border border-[var(--green)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              {t.marketPanel.heading}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              {t.common.demoBadge}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            {t.marketPanel.subheading}
          </p>
        </div>

        {/* Filters and Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Crop Selector */}
          <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--card-border)] px-2.5 py-1 rounded-xl text-xs">
            <Tag className="w-3.5 h-3.5 text-[var(--muted)]" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent text-[var(--ink)] font-semibold outline-none cursor-pointer"
            >
              {AVAILABLE_CROPS.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-[var(--card-bg)] text-[var(--ink)]">
                  {c.icon} {language === 'bn' ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--card-border)] px-2.5 py-1 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-[var(--ink)] font-semibold outline-none cursor-pointer"
            >
              {AVAILABLE_DISTRICTS.map((d) => (
                <option key={d.nameEn} value={d.nameEn} className="bg-[var(--card-bg)] text-[var(--ink)]">
                  {language === 'bn' ? d.nameBn : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* 7D / 30D Range Toggle */}
          <div className="inline-flex p-0.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)]">
            <button
              onClick={() => {
                setLoading(true);
                setRangeDays(7);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                rangeDays === 7
                  ? 'bg-[var(--green)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.marketPanel.range7D}
            </button>
            <button
              onClick={() => {
                setLoading(true);
                setRangeDays(30);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                rangeDays === 30
                  ? 'bg-[var(--green)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.marketPanel.range30D}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        {/* Current Market Price */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
          <span className="text-[11px] font-medium text-[var(--muted)] block">
            {t.marketPanel.currentPrice}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black font-heading text-[var(--ink)]">
              ৳{currentPrice.toFixed(1)}
            </span>
            <span className="text-[11px] text-[var(--muted)]">/কেজি</span>
          </div>
        </div>

        {/* 7D/30D Trend Indicator */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
          <span className="text-[11px] font-medium text-[var(--muted)] block">
            {rangeDays === 7 ? '৭ দিনের ট্রেন্ড' : '৩০ দিনের ট্রেন্ড'}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {changePercent > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--up)]">
                <TrendingUp className="w-4 h-4" />
                <span>+{changePercent}%</span>
              </span>
            ) : changePercent < 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--down)]">
                <TrendingDown className="w-4 h-4" />
                <span>{changePercent}%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
                <Minus className="w-4 h-4" />
                <span>0.0%</span>
              </span>
            )}
            <span className="text-[10px] text-[var(--muted)] truncate">
              {changePercent > 1
                ? t.marketPanel.trendRising
                : changePercent < -1
                ? t.marketPanel.trendFalling
                : t.marketPanel.trendStable}
            </span>
          </div>
        </div>

        {/* Farmer Listed Price */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--muted)] block">
              {t.marketPanel.farmerPriceLine}
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--farmer-price)]"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black font-heading text-[var(--farmer-price)]">
              ৳{farmerPrice.toFixed(1)}
            </span>
            <span className="text-[11px] text-[var(--muted)]">/কেজি</span>
          </div>
        </div>

        {/* Market vs Farmer Price Comparison */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
          <span className="text-[11px] font-medium text-[var(--muted)] block">
            {t.marketPanel.priceDifference}
          </span>
          <div className="mt-1">
            {diffFromFarmer < 0 ? (
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-100 text-green-900 border border-green-200">
                {Math.abs(diffFromFarmer)}% {t.marketPanel.belowMarket}
              </span>
            ) : diffFromFarmer > 0 ? (
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {diffFromFarmer}% {t.marketPanel.aboveMarket}
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900">
                {t.marketPanel.onMarket}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Legend info */}
      <div className="flex items-center justify-end gap-4 text-xs mb-3 text-[var(--muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 rounded bg-[var(--green)]"></span>
          <span>{language === 'bn' ? 'দৈনিক বাজার দর' : 'Daily Market Price'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[var(--farmer-price)]"></span>
          <span className="font-semibold text-[var(--farmer-price)]">
            {t.marketPanel.farmerPriceLine} (৳{farmerPrice.toFixed(1)})
          </span>
        </div>
      </div>

      {/* Recharts AreaChart Container */}
      <div className="w-full h-72 sm:h-80">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-[var(--muted)]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin"></div>
              <span>{t.common.loading}</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="marketPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 3', 'dataMax + 4']}
                unit="৳"
              />
              <Tooltip
                content={
                  <MarketChartTooltip language={language} farmerPrice={farmerPrice} />
                }
              />
              {/* Farmer Price ReferenceLine - Dashed with farmer-price line color #C98A06 */}
              <ReferenceLine
                y={farmerPrice}
                stroke="var(--farmer-price)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `কৃষকের দর: ৳${farmerPrice.toFixed(1)}`,
                  position: 'insideTopRight',
                  fill: 'var(--farmer-price)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="marketPrice"
                stroke="var(--green)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#marketPriceGradient)"
                isAnimationActive={true}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Disclaimer / Model Note */}
      <div className="mt-5 p-3 rounded-2xl bg-[var(--tint)]/60 border border-[var(--card-border)] flex items-start gap-2.5 text-xs text-[var(--ink)]/80">
        <Info className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-medium">{t.marketPanel.disclaimer}</p>
          <p className="text-[11px] text-[var(--muted)]">{t.marketPanel.demoDataNotice}</p>
        </div>
      </div>
    </motion.div>
  );
}
