'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { OrderStatus } from '@prisma/client';
import {
  Package,
  Calendar,
  Tractor,
  MapPin,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface OrderItemSummary {
  id: string;
  nameBn: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string | null;
}

export interface BuyerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  productCost: number;
  transportCost: number;
  totalAmount: number;
  distanceKm: number | null;
  createdAt: string;
  farmer: {
    fullName: string;
    phone: string;
    districtBn: string;
    districtEn: string;
  };
  deliveryDistrict: {
    nameBn: string;
    nameEn: string;
  };
  items: OrderItemSummary[];
}

export function OrdersListClient({ initialOrders }: { initialOrders: BuyerOrderSummary[] }) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');

  const filteredOrders = initialOrders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: language === 'bn' ? 'অপেক্ষারত' : 'Pending',
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
          label: language === 'bn' ? 'পথিমধ্যে' : 'In Transit',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400',
          icon: Truck,
        };
      case 'DELIVERED':
        return {
          label: language === 'bn' ? 'পৌঁছেছে' : 'Delivered',
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
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', labelBn: 'সকল অর্ডার', labelEn: 'All Orders' },
          { key: 'PENDING', labelBn: 'অপেক্ষারত', labelEn: 'Pending' },
          { key: 'CONFIRMED', labelBn: 'নিশ্চিতকৃত', labelEn: 'Confirmed' },
          { key: 'SHIPPED', labelBn: 'পথিমধ্যে', labelEn: 'In Transit' },
          { key: 'DELIVERED', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
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

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={order.id}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-6 shadow-sm hover:border-[var(--green)]/30 transition-all space-y-4"
              >
                {/* Header: Order No, Date, Status */}
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

                {/* Farmer & Route Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <Tractor className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--ink)] block">{order.farmer.fullName}</span>
                      <div className="flex items-center gap-1 text-[var(--muted)] text-[11px]">
                        <MapPin className="w-3 h-3 text-[var(--green)]" />
                        <span>
                          {language === 'bn' ? order.farmer.districtBn : order.farmer.districtEn}
                        </span>
                        <span>➔</span>
                        <span>
                          {language === 'bn'
                            ? order.deliveryDistrict.nameBn
                            : order.deliveryDistrict.nameEn}
                        </span>
                        {order.distanceKm && <span>({order.distanceKm} কি.মি.)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[var(--muted)] block">সর্বমোট প্রদেয়</span>
                    <span className="text-lg font-black font-heading text-[var(--green)]">
                      ৳{order.totalAmount.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="pt-2 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs"
                      >
                        {it.imageUrl && (
                          <div className="relative w-4 h-4 rounded overflow-hidden">
                            <Image src={it.imageUrl} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <span className="font-semibold text-[var(--ink)]">
                          {language === 'bn' ? it.nameBn : it.nameEn}
                        </span>
                        <span className="text-[var(--muted)]">({it.quantity} কেজি)</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--tint)] text-[var(--green)] hover:bg-[var(--tint)]/80 text-xs font-bold transition-colors"
                  >
                    <span>{language === 'bn' ? 'ট্র্যাকিং ও বিস্তারিত' : 'Track Order'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl space-y-3">
          <Package className="w-12 h-12 mx-auto text-[var(--muted)]" />
          <h3 className="text-base font-bold text-[var(--ink)]">
            {language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {language === 'bn'
              ? 'আপনার কোনো চলমান বা পূর্ববর্তী অর্ডার নেই।'
              : 'You have not placed any orders yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
