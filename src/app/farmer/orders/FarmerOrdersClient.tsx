'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { updateFarmerOrderStatusAction } from '@/app/orders/actions';
import { OrderStatus } from '@prisma/client';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export interface FarmerOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  productCost: number;
  transportCost: number;
  totalAmount: number;
  deliveryAddress: string;
  distanceKm: number | null;
  createdAt: string;
  buyer: {
    name: string;
    phone: string | null;
  };
  deliveryDistrict: {
    nameBn: string;
    nameEn: string;
  };
  items: {
    id: string;
    nameBn: string;
    nameEn: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

export function FarmerOrdersClient({ initialOrders }: { initialOrders: FarmerOrderRow[] }) {
  const { language } = useLanguage();
  const router = useRouter();

  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredOrders = initialOrders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setError(null);

    const res = await updateFarmerOrderStatusAction(orderId, newStatus);
    if (!res.success) {
      setError(res.error || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
      setUpdatingId(null);
      return;
    }

    router.refresh();
    setUpdatingId(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: language === 'bn' ? 'নতুন অপেক্ষারত' : 'Pending',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
          icon: Clock,
        };
      case 'CONFIRMED':
        return {
          label: language === 'bn' ? 'নিশ্চিতকৃত' : 'Confirmed',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
          icon: Package,
        };
      case 'SHIPPED':
        return {
          label: language === 'bn' ? 'পরিবহনে প্রেরিত' : 'Shipped',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400',
          icon: Truck,
        };
      case 'DELIVERED':
        return {
          label: language === 'bn' ? 'সম্পন্ন' : 'Delivered',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          label: language === 'bn' ? 'বাতিল' : 'Cancelled',
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
          icon: XCircle,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top filter tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', labelBn: 'সকল অর্ডার', labelEn: 'All Orders' },
          { key: 'PENDING', labelBn: 'নতুন অপেক্ষারত', labelEn: 'Pending' },
          { key: 'CONFIRMED', labelBn: 'নিশ্চিতকৃত', labelEn: 'Confirmed' },
          { key: 'SHIPPED', labelBn: 'পরিবহনে প্রেরিত', labelEn: 'Shipped' },
          { key: 'DELIVERED', labelBn: 'ডেলিভারি সম্পন্ন', labelEn: 'Delivered' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'ALL' | OrderStatus)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.key
                ? 'bg-[var(--green)] text-white shadow-sm'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--ink)]/80 hover:bg-[var(--tint)]'
            }`}
          >
            {language === 'bn' ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm sm:text-base text-[var(--ink)]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.classes}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{order.createdAt.substring(0, 10)}</span>
                  </div>
                </div>

                {/* Buyer & Destination Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">ক্রেতার নাম ও ঠিকানা:</span>
                    <span className="font-bold text-[var(--ink)] text-sm">{order.buyer.name}</span>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">
                      {order.deliveryAddress}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] text-[var(--muted)] block">ফসল মূল্য / সর্বমোট</span>
                    <span className="text-sm font-semibold text-[var(--ink)] block">
                      ৳{order.productCost.toFixed(1)} (+ভাড়া ৳{order.transportCost})
                    </span>
                    <span className="text-base font-black font-heading text-[var(--green)]">
                      ৳{order.totalAmount.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="p-3 bg-[var(--bg)] rounded-2xl border border-[var(--card-border)] space-y-1 text-xs">
                  <span className="font-bold text-[var(--muted)] block text-[11px]">চালানের ফসলসমূহ:</span>
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-[var(--ink)]">
                      <span>{language === 'bn' ? it.nameBn : it.nameEn} ({it.quantity} কেজি)</span>
                      <span className="font-bold">৳{it.subtotal.toFixed(1)}</span>
                    </div>
                  ))}
                </div>

                {/* Farmer Action Buttons based on status */}
                <div className="pt-2 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs text-[var(--green)] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>চালান বিস্তারিত</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>অর্ডার নিশ্চিত করুন</span>
                        </button>
                      </>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        <span>পরিবহনে পাঠিয়ে দিন (Mark Shipped)</span>
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>ডেলিভারি সম্পন্ন (Mark Delivered)</span>
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>চালান সফলভাবে খালাস হয়েছে</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl space-y-3">
          <Package className="w-12 h-12 mx-auto text-[var(--muted)]" />
          <h3 className="text-base font-bold text-[var(--ink)]">
            {language === 'bn' ? 'কোনো অর্ডার নেই' : 'No orders found'}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {language === 'bn'
              ? 'বর্তমানে এই ফিল্টারে কোনো অর্ডার অবশিষ্ট নেই।'
              : 'There are no active orders matching this filter.'}
          </p>
        </div>
      )}
    </div>
  );
}
