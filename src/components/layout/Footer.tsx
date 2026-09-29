'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Sprout, Heart, Shield, TrendingUp, Truck } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[var(--tint)]/50 border-t border-[var(--card-border)] mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--green)] flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-heading text-[var(--ink)]">
                {t.common.siteName}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md">
              {t.footer.aboutText}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--green)]">
              <Shield className="w-4 h-4" />
              <span>কৃষক ও ভোক্তার সরাসরি নির্ভরযোগ্য মেলবন্ধন</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-[var(--ink)] uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--green)] transition-colors">
                  {t.common.home}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[var(--green)] transition-colors">
                  {t.common.browseProducts}
                </Link>
              </li>
              <li>
                <Link href="/market-prices" className="hover:text-[var(--green)] transition-colors">
                  {t.common.marketPrices}
                </Link>
              </li>
              <li>
                <Link href="/transport" className="hover:text-[var(--green)] transition-colors">
                  {t.common.transportRent}
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillars */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-[var(--ink)] uppercase tracking-wider">
              প্ল্যাটফর্ম সুবিধা
            </h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--up)]" />
                <span>৩০ দিনের ঐতিহাসিক বাজার দর</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--green)]" />
                <span>স্বয়ংক্রিয় দূরত্ব ও ভাড়া হিসাব</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--farmer-price)]" />
                <span>যাচাইকৃত স্থানীয় কৃষক প্রোফাইল</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-4">
          <div>{t.footer.rights}</div>
          <div className="flex items-center gap-1">
            <span>বাংলাদেশী কৃষকদের সম্মানে নির্মিত</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
