'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart, CartItem } from '@/lib/cart/CartContext';
import { calculateTransportQuote } from '@/lib/transport';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  Tractor,
  MapPin,
  ArrowLeft,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';

interface DistrictOption {
  id: string;
  nameBn: string;
  nameEn: string;
  latitude: number;
  longitude: number;
}

interface Props {
  districts: DistrictOption[];
}

export function CartClient({ districts }: Props) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    buyerDistrictId,
    setBuyerDistrictId,
  } = useCart();

  // Active delivery district
  const selectedDistrictId =
    buyerDistrictId || districts.find((d) => d.nameEn === 'Dhaka')?.id || districts[0]?.id || '';

  const selectedDistrict = useMemo(() => {
    return districts.find((d) => d.id === selectedDistrictId) || districts[0];
  }, [districts, selectedDistrictId]);

  // Group items by farmerProfileId
  const farmerGroups = useMemo(() => {
    const groups: { [key: string]: CartItem[] } = {};
    items.forEach((item) => {
      const key = item.farmerProfileId || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  // Calculate costs per farmer group
  const groupCalculations = useMemo(() => {
    return Object.entries(farmerGroups).map(([farmerId, groupItems]) => {
      const farmerName = groupItems[0]?.farmerName || 'Farmer';
      const farmName = groupItems[0]?.farmName || 'Farm';
      const farmDistrictId = groupItems[0]?.farmDistrictId || '';
      const farmDistrictBn = groupItems[0]?.farmDistrictNameBn || '';
      const farmDistrictEn = groupItems[0]?.farmDistrictNameEn || '';

      const farmDistObj = districts.find((d) => d.id === farmDistrictId);
      const farmLat = groupItems[0]?.farmLatitude ?? farmDistObj?.latitude ?? 23.8103;
      const farmLon = groupItems[0]?.farmLongitude ?? farmDistObj?.longitude ?? 90.4125;

      const totalWeightKg = groupItems.reduce((acc, item) => acc + item.quantity, 0);
      const produceCost = groupItems.reduce(
        (acc, item) => acc + item.quantity * item.pricePerKg,
        0
      );

      const transportQuote = selectedDistrict
        ? calculateTransportQuote(
            farmLat,
            farmLon,
            selectedDistrict.latitude,
            selectedDistrict.longitude,
            totalWeightKg
          )
        : null;

      const transportCost = transportQuote?.estimatedCost || 0;
      const groupTotal = produceCost + transportCost;

      return {
        farmerId,
        farmerName,
        farmName,
        farmDistrictBn,
        farmDistrictEn,
        items: groupItems,
        totalWeightKg,
        produceCost,
        transportQuote,
        transportCost,
        groupTotal,
      };
    });
  }, [farmerGroups, districts, selectedDistrict]);

  // Grand totals
  const totalProduceCost = groupCalculations.reduce((acc, g) => acc + g.produceCost, 0);
  const totalTransportCost = groupCalculations.reduce((acc, g) => acc + g.transportCost, 0);
  const grandTotal = totalProduceCost + totalTransportCost;
  const totalWeight = groupCalculations.reduce((acc, g) => acc + g.totalWeightKg, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
            {language === 'bn' ? 'আপনার ঝুড়ি খালি' : 'Your Shopping Cart is Empty'}
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            {language === 'bn'
              ? 'কৃষকদের তালিকাভুক্ত তাজা ফসল দেখে আপনার প্রয়োজনীয় পণ্য ঝুড়িতে যুক্ত করুন।'
              : 'Explore freshly listed produce from farmers across the country and add them to your cart.'}
          </p>
        </div>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--green)] text-white text-sm font-bold shadow-sm hover:bg-[var(--green-hover)] transition-colors"
          >
            <span>{language === 'bn' ? 'ফসল বাজার দেখুন' : 'Browse Products'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ফসল বাজারে ফিরুন' : 'Back to Marketplace'}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)] flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-[var(--green)]" />
            <span>{language === 'bn' ? 'আপনার পণ্যের ঝুড়ি' : 'Shopping Cart'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            {language === 'bn'
              ? 'নিয়ম অনুযায়ী প্রতিটি কৃষকের জন্য আলাদা ডেলিভারি চালান ও পরিবহন ভাড়া হিসাব করা হয়েছে।'
              : 'Per marketplace policy, orders are grouped by farmer with individual transport calculations.'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ঝুড়ি খালি করুন' : 'Clear Cart'}</span>
        </button>
      </div>

      {/* Main Content: Split into Order Groups (Left) & Grand Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Farmer Groups */}
        <div className="lg:col-span-8 space-y-6">
          {groupCalculations.map((group, groupIdx) => (
            <div
              key={group.farmerId}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
            >
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--green)]">
                        {language === 'bn' ? `অর্ডার গ্রুপ #${groupIdx + 1}:` : `Order Group #${groupIdx + 1}:`}
                      </span>
                      <span className="font-heading font-bold text-sm sm:text-base text-[var(--ink)]">
                        {group.farmerName} ({group.farmName})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                      <MapPin className="w-3 h-3 text-[var(--green)]" />
                      <span>{language === 'bn' ? group.farmDistrictBn : group.farmDistrictEn}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--tint)] text-[var(--green)] font-semibold self-start sm:self-auto">
                  {language === 'bn' ? `${group.items.length}টি ফসল` : `${group.items.length} items`} ({group.totalWeightKg} কেজি)
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[var(--card-border)]">
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-2xl bg-[var(--tint)] overflow-hidden shrink-0 border border-[var(--card-border)]">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={language === 'bn' ? item.nameBn : item.nameEn}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🌾
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-heading font-bold text-sm text-[var(--ink)] hover:text-[var(--green)] line-clamp-1"
                        >
                          {language === 'bn' ? item.nameBn : item.nameEn}
                        </Link>
                        <div className="text-xs text-[var(--muted)]">
                          <span>৳{item.pricePerKg} / {item.unit}</span>
                          <span className="mx-1">•</span>
                          <span>{language === 'bn' ? `নূন্যতম ${item.minimumOrderQty} ${item.unit}` : `Min ${item.minimumOrderQty} ${item.unit}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center border border-[var(--card-border)] rounded-xl bg-[var(--bg)] p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 5)}
                          disabled={item.quantity <= item.minimumOrderQty}
                          className="w-7 h-7 rounded-lg bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--tint)] disabled:opacity-40 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-12 text-center text-xs font-bold text-[var(--ink)]">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 5)}
                          disabled={item.quantity >= item.availableStock}
                          className="w-7 h-7 rounded-lg bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--tint)] disabled:opacity-40 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="block text-sm font-black font-heading text-[var(--green)]">
                          ৳{(item.quantity * item.pricePerKg).toFixed(1)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-[var(--muted)] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Group Transport & Subtotal Footer */}
              <div className="pt-3 border-t border-[var(--card-border)] bg-[var(--bg)] rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[var(--muted)]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[var(--green)]" />
                    <span>
                      {language === 'bn' ? 'পরিবহন ভাড়া (' : 'Transport Freight ('}
                      {group.transportQuote?.vehicleNameBn || 'Truck'},{' '}
                      {group.transportQuote?.roadDistanceKm} কি.মি.)
                    </span>
                  </div>
                  <span className="font-bold text-[var(--ink)]">৳{group.transportCost}</span>
                </div>

                <div className="flex justify-between items-baseline pt-1 border-t border-[var(--card-border)]/50">
                  <span className="font-bold text-[var(--ink)]">
                    {language === 'bn' ? 'এই কৃষকের চালান উপমোট' : 'Order Subtotal for Farmer'}:
                  </span>
                  <span className="font-black text-base font-heading text-[var(--green)]">
                    ৳{group.groupTotal.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Destination District & Grand Total (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="font-heading font-bold text-lg text-[var(--ink)]">
              {language === 'bn' ? 'অর্ডার ও ডেলিভারি সারসংক্ষেপ' : 'Order & Delivery Summary'}
            </h2>

            {/* Destination District Selection */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1.5">
                {language === 'bn' ? 'ডেলিভারি গন্তব্য জেলা' : 'Delivery Destination District'}
              </label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setBuyerDistrictId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {language === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--muted)] mt-1">
                {language === 'bn'
                  ? 'গন্তব্য পরিবর্তন করলে স্বয়ংক্রিয়ভাবে পরিবহন ভাড়া আপডেট হবে।'
                  : 'Changing destination recalculates transport costs dynamically.'}
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-[var(--card-border)] text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'পৃথক কৃষক অর্ডার' : 'Split Orders'}:</span>
                <span className="font-bold text-[var(--ink)]">
                  {groupCalculations.length} {language === 'bn' ? 'টি' : 'orders'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'মোট ফসলের ওজন' : 'Total Produce Weight'}:</span>
                <span className="font-bold text-[var(--ink)]">{totalWeight} {t.common.kg}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'মোট ফসলের মূল্য' : 'Total Produce Cost'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{totalProduceCost.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'সর্বমোট পরিবহন ভাড়া' : 'Total Freight Charge'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{totalTransportCost}</span>
              </div>
            </div>

            {/* Split Order Information Notice */}
            <div className="p-3 rounded-2xl bg-[var(--tint)]/70 text-[11px] text-[var(--ink)]/80 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? 'চেকআউটের পর প্রতি কৃষকের জন্য আলাদা অর্ডার আইডি এবং ক্যাশ অন ডেলিভারি রশিদ তৈরি হবে।'
                  : 'Separate individual orders will be created per farmer for transparent dispatch and Cash on Delivery.'}
              </span>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-[var(--card-border)] flex items-baseline justify-between">
              <span className="text-base font-bold text-[var(--ink)]">
                {language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Grand Total'}:
              </span>
              <span className="text-3xl font-black font-heading text-[var(--green)]">
                ৳{grandTotal.toFixed(1)}
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[var(--green)] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--green-hover)] shadow-sm transition-all active:scale-[0.98]"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'চেকআউট ও ঠিকানা দিন' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
