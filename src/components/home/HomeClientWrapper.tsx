'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';
import { MarketPricePanel } from './MarketPricePanel';
import { ProductCard, ProductItem } from './ProductCard';
import { useSession, signIn } from 'next-auth/react';
import {
  ArrowRight,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Tractor,
  UserCheck,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon: string | null;
}

export function HomeClientWrapper({
  products,
  categories,
}: {
  products: ProductItem[];
  categories: CategoryItem[];
}) {
  const { language, t } = useLanguage();
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [demoLoginLoading, setDemoLoginLoading] = useState<string | null>(null);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          (p) =>
            p.category.nameEn.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            p.category.nameBn.includes(selectedCategory)
        );

  const handleQuickDemoLogin = async (email: string, roleName: string) => {
    try {
      setDemoLoginLoading(roleName);
      await signIn('credentials', {
        email,
        password: 'Krishi@123456',
        redirect: false,
      });
      window.location.reload();
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setDemoLoginLoading(null);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-4">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[var(--tint)]/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Main Hero Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Top pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--tint)] text-[var(--green)] border border-[var(--green)]/20 shadow-xs"
            >
              <span>{t.hero.badge}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[var(--ink)] tracking-tight leading-[1.15]"
            >
              {t.hero.title}
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[var(--muted)] leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            {/* Hero CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--green)] text-white text-sm font-bold hover:bg-[var(--green-hover)] transition-all shadow-md active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.hero.browseBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?role=farmer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--card-border)] text-sm font-bold hover:bg-[var(--tint)]/50 transition-all shadow-xs active:scale-98"
              >
                <Tractor className="w-4 h-4 text-[var(--green)]" />
                <span>{t.hero.sellBtn}</span>
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-[var(--muted)]"
            >
              <div className="flex items-center justify-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
                <span>{t.hero.trustStats.districts}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
                <span>{t.hero.trustStats.farmers}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
                <span>{t.hero.trustStats.priceTrend}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
                <span>{t.hero.trustStats.directTransport}</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Demo Role Switcher (For testing Auth.js roles) */}
          <div className="p-4 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[var(--ink)] font-bold">
                <UserCheck className="w-4 h-4 text-[var(--green)]" />
                <span>{t.auth.quickLoginNotice}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@krishibazar.gov.bd', 'ADMIN')}
                  disabled={demoLoginLoading !== null}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white font-semibold hover:bg-emerald-900 transition-colors shadow-xs active:scale-95"
                >
                  {demoLoginLoading === 'ADMIN' ? '...' : t.auth.roleAdmin}
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('editor@krishibazar.gov.bd', 'EDITOR')}
                  disabled={demoLoginLoading !== null}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors shadow-xs active:scale-95"
                >
                  {demoLoginLoading === 'EDITOR' ? '...' : t.auth.roleEditor}
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('farmer.rahim@krishibazar.com', 'FARMER')}
                  disabled={demoLoginLoading !== null}
                  className="px-2.5 py-1.5 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors shadow-xs active:scale-95"
                >
                  {demoLoginLoading === 'FARMER' ? '...' : t.auth.roleFarmer}
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('buyer.hasan@krishibazar.com', 'BUYER')}
                  disabled={demoLoginLoading !== null}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors shadow-xs active:scale-95"
                >
                  {demoLoginLoading === 'BUYER' ? '...' : t.auth.roleBuyer}
                </button>
              </div>
            </div>
            {session?.user && (
              <div className="mt-2 pt-2 border-t border-[var(--card-border)]/60 text-center text-xs text-[var(--green)] font-semibold">
                ✓ {language === 'bn' ? 'বর্তমান সক্রিয় রোল:' : 'Current active user:'}{' '}
                {session.user.name} ({String((session.user as { role?: string }).role)})
              </div>
            )}
          </div>

          {/* Hero Market Price Panel (Key design requirement) */}
          <div className="max-w-5xl mx-auto">
            <MarketPricePanel />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--ink)]">
            {language === 'bn' ? 'জনপ্রিয় কৃষি ফসল' : 'Popular Crops'}
          </h2>
          <span className="text-xs text-[var(--muted)] font-medium">
            {categories.length} {language === 'bn' ? 'টি ক্যাটাগরি' : 'categories'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              selectedCategory === 'all'
                ? 'bg-[var(--green)] text-white border-[var(--green)] shadow-sm'
                : 'bg-[var(--card-bg)] text-[var(--ink)] border-[var(--card-border)] hover:bg-[var(--tint)]/60'
            }`}
          >
            🌱 {t.common.allCategories}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--green)] text-white border-[var(--green)] shadow-sm'
                    : 'bg-[var(--card-bg)] text-[var(--ink)] border-[var(--card-border)] hover:bg-[var(--tint)]/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)] tracking-tight">
              {t.products.heading}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">{t.products.subheading}</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--green)] hover:underline"
          >
            <span>{t.products.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl">
            <p className="text-sm text-[var(--muted)]">
              {language === 'bn' ? 'কোনো ফসল পাওয়া যায়নি।' : 'No crops found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. DIRECT TRANSPORT & FAIR PRICING TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[var(--tint)] border border-[var(--card-border)] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--card-bg)] text-[var(--green)] border border-[var(--card-border)]">
              <Truck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্বচ্ছ পরিবহন হিসাব' : 'Transparent Transport Calculation'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-[var(--ink)]">
              {language === 'bn'
                ? 'দূরত্ব এবং গাড়ির ধরন অনুযায়ী সঠিক ভাড়া'
                : 'Exact Freight Cost by Haversine Distance & Vehicle Type'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {language === 'bn'
                ? 'পিকআপ, কাভার্ড ভ্যান কিংবা ভারী ট্রাক—কৃষকের জেলা থেকে আপনার গন্তব্যের রাস্তার দূরত্ব হিসাব করে রিয়েলটাইম ভাড়া আগেই জেনে নিন।'
                : 'From small pickups to 15-ton multi-axle freight trucks—estimate inter-district road haulage instantly before placing orders.'}
            </p>
          </div>
          <Link
            href="/transport"
            className="shrink-0 px-6 py-3 rounded-2xl bg-[var(--green)] text-white text-xs sm:text-sm font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm active:scale-95"
          >
            {language === 'bn' ? 'ভাড়া ক্যালকুলেটর দেখুন' : 'Open Transport Estimator'}
          </Link>
        </div>
      </section>
    </div>
  );
}
