'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Check, Clock, CheckCircle2, Truck, Package, XCircle } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

interface Props {
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export function StatusTimeline({ status, createdAt }: Props) {
  const { language } = useLanguage();

  if (status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <div className="font-bold text-sm text-red-800 dark:text-red-300">
            {language === 'bn' ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order Cancelled'}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {language === 'bn'
              ? 'এই চালানটির কার্যক্রম সমাপ্ত হয়েছে এবং পণ্য স্টক ফিরিয়ে দেওয়া হয়েছে।'
              : 'This shipment was cancelled and available stocks have been restored.'}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: 'PENDING',
      labelBn: 'অর্ডার গৃহীত',
      labelEn: 'Order Placed',
      subBn: 'কৃষকের অনুমোদনের অপেক্ষায়',
      subEn: 'Awaiting farmer confirmation',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      labelBn: 'নিশ্চিতকৃত',
      labelEn: 'Confirmed',
      subBn: 'ফসল প্যাকিং ও প্রস্তুত',
      subEn: 'Packaging & readying crop',
      icon: Package,
    },
    {
      key: 'SHIPPED',
      labelBn: 'পথিমধ্যে (পরিবহন)',
      labelEn: 'In Transit',
      subBn: 'গন্তব্যের উদ্দেশ্যে রওনা হয়েছে',
      subEn: 'Dispatched on freight vehicle',
      icon: Truck,
    },
    {
      key: 'DELIVERED',
      labelBn: 'ডেলিভারি সম্পন্ন',
      labelEn: 'Delivered',
      subBn: 'ক্রেতা কর্তৃক বুঝে নেওয়া হয়েছে',
      subEn: 'Handed over & payment collected',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="space-y-4 py-2">
      {/* Step Circles & Connectors */}
      <div className="relative flex items-center justify-between">
        {/* Connector Line Background */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[var(--card-border)] -z-0" />
        {/* Connector Line Active Progress */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[var(--green)] transition-all duration-500 -z-0"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-[var(--green)] border-[var(--green)] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[var(--card-bg)] border-[var(--green)] text-[var(--green)] ring-4 ring-[var(--green)]/20 shadow-md'
                    : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          const isCompleted = idx <= currentIdx;

          return (
            <div key={step.key} className="space-y-0.5">
              <div
                className={`text-xs font-bold ${
                  isCurrent
                    ? 'text-[var(--green)]'
                    : isCompleted
                    ? 'text-[var(--ink)]'
                    : 'text-[var(--muted)]'
                }`}
              >
                {language === 'bn' ? step.labelBn : step.labelEn}
              </div>
              <div className="text-[10px] text-[var(--muted)] hidden sm:block">
                {language === 'bn' ? step.subBn : step.subEn}
              </div>
              {idx === 0 && (
                <div className="text-[9px] text-[var(--muted)] font-mono">
                  {createdAt.substring(0, 10)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
