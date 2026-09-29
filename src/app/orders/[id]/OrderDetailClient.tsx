'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { StatusTimeline } from '@/components/orders/StatusTimeline';
import { cancelBuyerOrderAction } from '../actions';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Tractor,
  Loader2,
  XCircle,
  Package,
} from 'lucide-react';

interface OrderDetailProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    productCost: number;
    transportCost: number;
    totalAmount: number;
    deliveryAddress: string;
    distanceKm: number | null;
    createdAt: string;
    updatedAt: string;
    farmer: {
      fullName: string;
      phone: string;
      bio: string | null;
      districtBn: string;
      districtEn: string;
    };
    deliveryDistrict: {
      nameBn: string;
      nameEn: string;
    };
    vehicleType?: {
      nameBn: string;
      nameEn: string;
      ratePerKm: number;
    } | null;
    items: {
      id: string;
      productId: string;
      nameBn: string;
      nameEn: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      imageUrl: string | null;
    }[];
    payments: {
      id: string;
      amount: number;
      method: string;
      status: PaymentStatus;
      notes: string | null;
      createdAt: string;
    }[];
  };
}

export function OrderDetailClient({ order }: OrderDetailProps) {
  const { language } = useLanguage();
  const router = useRouter();

  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?' : 'Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    setError(null);

    const res = await cancelBuyerOrderAction(order.id);
    if (!res.success) {
      setError(res.error || 'অর্ডার বাতিল করতে সমস্যা হয়েছে।');
      setCancelling(false);
      return;
    }

    router.refresh();
  };

  const isPending = order.status === 'PENDING';
  const payment = order.payments[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সকল অর্ডারে ফিরুন' : 'Back to Orders'}</span>
        </Link>

        {isPending && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            {cancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>বাতিল হচ্ছে...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Header Info */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--card-border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)] font-medium">
                {language === 'bn' ? 'অর্ডার আইডি:' : 'Order ID:'}
              </span>
              <span className="font-mono font-black text-lg text-[var(--ink)]">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{order.createdAt.substring(0, 10)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[var(--muted)] block">সর্বমোট প্রদেয়</span>
            <span className="text-2xl font-black font-heading text-[var(--green)]">
              ৳{order.totalAmount.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Live Timeline Component */}
        <div>
          <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
            {language === 'bn' ? 'ডেলিভারি অগ্রগতি ও ট্র্যাকিং' : 'Delivery Progress & Timeline'}
          </h3>
          <StatusTimeline
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Farmer Contact (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Table */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <Package className="w-5 h-5 text-[var(--green)]" />
              <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                {language === 'bn' ? 'চালানের ফসলসমূহ' : 'Ordered Produce Items'}
              </h3>
            </div>

            <div className="divide-y divide-[var(--card-border)]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-[var(--tint)] overflow-hidden shrink-0 border border-[var(--card-border)]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🌾</div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-heading font-bold text-xs sm:text-sm text-[var(--ink)] hover:text-[var(--green)]"
                      >
                        {language === 'bn' ? item.nameBn : item.nameEn}
                      </Link>
                      <div className="text-[11px] text-[var(--muted)]">
                        ৳{item.unitPrice} × {item.quantity} কেজি
                      </div>
                    </div>
                  </div>

                  <span className="font-bold text-sm text-[var(--green)]">
                    ৳{item.subtotal.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Farmer Info */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-[var(--green)]" />
                <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                  {language === 'bn' ? 'কৃষকের পরিচয় ও যোগাযোগ' : 'Farmer & Origin'}
                </h3>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {language === 'bn' ? order.farmer.districtBn : order.farmer.districtEn}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <span className="font-bold text-sm text-[var(--ink)] block">{order.farmer.fullName}</span>
                <span className="text-xs text-[var(--muted)]">
                  {order.farmer.bio || (language === 'bn' ? 'যাচাইকৃত স্থানীয় কৃষক' : 'Certified Local Farmer')}
                </span>
              </div>

              <a
                href={`tel:${order.farmer.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--tint)] text-[var(--green)] font-bold text-xs hover:bg-[var(--tint)]/80 transition-colors self-start sm:self-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.farmer.phone}</span>
              </a>
            </div>
          </div>

          {/* Delivery Destination Address */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <MapPin className="w-5 h-5 text-[var(--green)]" />
              <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                {language === 'bn' ? 'ডেলিভারি গন্তব্য ঠিকানা' : 'Delivery Destination'}
              </h3>
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Right Column: Billing & Freight (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-[var(--ink)]">
              {language === 'bn' ? 'মূল্য ও পরিবহন বিবরণী' : 'Cost & Freight Breakdown'}
            </h3>

            <div className="space-y-2 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'ফসলের মোট মূল্য' : 'Produce Cost'}:</span>
                <span className="font-bold text-[var(--ink)]">৳{order.productCost.toFixed(1)}</span>
              </div>

              <div className="flex justify-between">
                <span>
                  {language === 'bn' ? 'পরিবহন ভাড়া (' : 'Freight ('}
                  {order.distanceKm ? `${order.distanceKm} কি.মি.` : 'Standard'}
                  {')'}:
                </span>
                <span className="font-bold text-[var(--ink)]">৳{order.transportCost.toFixed(1)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--card-border)]">
                <span className="text-sm font-bold text-[var(--ink)]">
                  {language === 'bn' ? 'সর্বমোট চালান মূল্য' : 'Grand Total'}:
                </span>
                <span className="text-2xl font-black font-heading text-[var(--green)]">
                  ৳{order.totalAmount.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className="pt-3 border-t border-[var(--card-border)] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)] font-medium">পেমেন্ট মেথড:</span>
                <span className="font-bold text-[var(--ink)]">
                  {payment?.method === 'COD' ? 'Cash on Delivery (ক্যাশ অন ডেলিভারি)' : payment?.method || 'COD'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)] font-medium">পেমেন্ট স্ট্যাটাস:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    payment?.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {payment?.status === 'PAID' ? 'পরিশোধিত (PAID)' : 'বকেয়া (PENDING)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
