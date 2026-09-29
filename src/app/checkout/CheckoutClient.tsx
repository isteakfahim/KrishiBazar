'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart, CartItem } from '@/lib/cart/CartContext';
import { calculateTransportQuote } from '@/lib/transport';
import { placeOrdersAction, PlaceOrderInput } from './actions';
import {
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Banknote,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Tractor,
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

export function CheckoutClient({ districts }: Props) {
  const { language } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, clearCart, buyerDistrictId, setBuyerDistrictId } = useCart();

  const [recipientName, setRecipientName] = useState(session?.user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(
    (session?.user as { phone?: string })?.phone || '01712345678'
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    buyerDistrictId || districts.find((d) => d.nameEn === 'Dhaka')?.id || districts[0]?.id || ''
  );
  const [addressDetails, setAddressDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'ROCKET'>('COD');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const totalProduceCost = groupCalculations.reduce((acc, g) => acc + g.produceCost, 0);
  const totalTransportCost = groupCalculations.reduce((acc, g) => acc + g.transportCost, 0);
  const grandTotal = totalProduceCost + totalTransportCost;

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    setBuyerDistrictId(distId);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError(language === 'bn' ? 'অর্ডার করতে অনুগ্রহ করে লগইন করুন।' : 'Please login to checkout.');
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !addressDetails.trim()) {
      setError(
        language === 'bn'
          ? 'অনুগ্রহ করে প্রাপকের নাম, ফোন এবং সম্পূর্ণ ডেলিভারি ঠিকানা পূরণ করুন।'
          : 'Please complete all address and contact fields.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    const payload: PlaceOrderInput = {
      recipientName,
      recipientPhone,
      deliveryDistrictId: selectedDistrictId,
      deliveryAddress: addressDetails,
      paymentMethod,
      farmerGroups: groupCalculations.map((g) => ({
        farmerProfileId: g.farmerId,
        items: g.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          pricePerKg: i.pricePerKg,
        })),
      })),
    };

    const res = await placeOrdersAction(payload);
    if (!res.success) {
      setError(res.error || 'অর্ডার করতে সমস্যা হয়েছে।');
      setLoading(false);
      return;
    }

    clearCart();
    router.push('/orders?success=1');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading text-[var(--ink)]">
          {language === 'bn' ? 'চেকআউট করার জন্য ঝুড়িতে কোনো পণ্য নেই।' : 'No items in cart to checkout.'}
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--green)] text-white font-bold text-sm"
        >
          {language === 'bn' ? 'ফসল বাজার দেখুন' : 'Browse Marketplace'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/cart" className="hover:text-[var(--green)] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ঝুড়িতে ফিরুন' : 'Back to Cart'}</span>
        </Link>
      </div>

      <div className="border-b border-[var(--card-border)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
          {language === 'bn' ? 'ডেলিভারি ঠিকানা ও অর্ডার নিশ্চিতকরণ' : 'Checkout & Delivery Confirmation'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          {language === 'bn'
            ? 'সঠিক তথ্য প্রদান করুন। প্রতিটি কৃষকের ফসল নিজস্ব খামার থেকে সরাসরি ডেলিভারি হবে।'
            : 'Please verify recipient details. Products are dispatched directly from respective farm locations.'}
        </p>
      </div>

      {/* Guest/Auth Guard Notice */}
      {status === 'unauthenticated' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {language === 'bn' ? 'অর্ডার করতে অ্যাকাউন্ট প্রয়োজন' : 'Account Required for Checkout'}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {language === 'bn'
                  ? 'দ্রুত অর্ডার করতে ক্রেতা অ্যাকাউন্টে লগইন করুন।'
                  : 'Please sign in to complete your purchase.'}
              </p>
            </div>
          </div>
          <Link
            href="/login?callbackUrl=/checkout"
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors text-center shrink-0"
          >
            {language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Checkout Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address & Payment Method (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Address Details Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <MapPin className="w-5 h-5 text-[var(--green)]" />
              <h2 className="font-heading font-bold text-base text-[var(--ink)]">
                {language === 'bn' ? 'ডেলিভারি ঠিকানা ও প্রাপক' : 'Delivery Address & Recipient'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">
                  {language === 'bn' ? 'প্রাপকের পূর্ণ নাম' : 'Recipient Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. হাসান মাহমুদ"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">
                  {language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Mobile Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">
                  {language === 'bn' ? 'গন্তব্য জেলা' : 'Destination District'} *
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'bn' ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">
                  {language === 'bn' ? 'উপজেলা, ইউনিয়ন, বাজার / সুনির্দিষ্ট ঠিকানা' : 'Detailed Street Address / Landmark'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'বাড়ি নং, রাস্তা, ডাকঘর, উপজেলা, স্থানীয় ল্যান্ডমার্ক...'
                      : 'House, Road, Upazila, Landmark...'
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <Banknote className="w-5 h-5 text-[var(--green)]" />
              <h2 className="font-heading font-bold text-base text-[var(--ink)]">
                {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[var(--green)] bg-[var(--tint)]/50'
                    : 'border-[var(--card-border)] bg-[var(--bg)]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-[var(--green)] focus:ring-[var(--green)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                      {language === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'Cash on Delivery (COD)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--green)] text-white text-[10px] font-bold">
                      {language === 'bn' ? 'প্রস্তাবিত' : 'Default'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    {language === 'bn'
                      ? 'পণ্য এবং চালান বুঝে পাওয়ার পর পরিবহন প্রতিনিধির নিকট নগদ পরিশোধ করুন।'
                      : 'Pay cash directly to the freight carrier upon inspection and delivery.'}
                  </p>
                </div>
              </label>

              {/* bKash Sandbox */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'BKASH'
                    ? 'border-[var(--green)] bg-[var(--tint)]/50'
                    : 'border-[var(--card-border)] bg-[var(--bg)]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'BKASH'}
                  onChange={() => setPaymentMethod('BKASH')}
                  className="mt-1 text-[var(--green)] focus:ring-[var(--green)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                      বিকাশ (bKash Sandbox Simulator)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      নমুনা / Demo
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    {language === 'bn'
                      ? 'সরাসরি অনলাইন মোবাইল ব্যাংকিং ট্রানজেকশন সিমুলেশন।'
                      : 'Simulated sandbox mobile banking payment for phase demo.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Split Orders Overview & CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-heading font-bold text-base text-[var(--ink)]">
              {language === 'bn' ? 'অর্ডার চালান বিবরণী' : 'Order Shipments'}
            </h3>

            {/* Split Order breakdown */}
            <div className="space-y-3 divide-y divide-[var(--card-border)] max-h-72 overflow-y-auto pr-1">
              {groupCalculations.map((g) => (
                <div key={g.farmerId} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--ink)] flex items-center gap-1">
                      <Tractor className="w-3.5 h-3.5 text-[var(--green)]" />
                      <span>{g.farmerName}</span>
                    </span>
                    <span className="font-bold text-[var(--green)]">৳{g.groupTotal.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--muted)] pl-4">
                    <span>
                      {g.items.length}টি ফসল ({g.totalWeightKg} কেজি)
                    </span>
                    <span>ভাড়া: ৳{g.transportCost}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-[var(--card-border)] space-y-2 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'মোট ফসলের মূল্য' : 'Produce Cost'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{totalProduceCost.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'মোট পরিবহন ভাড়া' : 'Total Freight'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{totalTransportCost}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--card-border)]">
                <span className="text-sm font-bold text-[var(--ink)]">
                  {language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Grand Total'}:
                </span>
                <span className="text-2xl font-black font-heading text-[var(--green)]">
                  ৳{grandTotal.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Security Guarantee badge */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--tint)]/50 text-[11px] text-[var(--green)] font-semibold border border-[var(--card-border)]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'কৃষিবাজার সুরক্ষা: সঠিক গুণমান নিশ্চিতকরণের পরেই মূল্য হস্তান্তর করা হবে।'
                  : 'KrishiBazar Guarantee: Payment released post inspection.'}
              </span>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={loading || status === 'unauthenticated'}
              className="w-full py-3.5 px-4 rounded-2xl bg-[var(--green)] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--green-hover)] disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'অর্ডার প্রস্তুত হচ্ছে...' : 'Processing Orders...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm & Place Orders'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
