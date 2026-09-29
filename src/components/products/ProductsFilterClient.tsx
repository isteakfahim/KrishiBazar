'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProductCard, ProductItem } from '@/components/home/ProductCard';
import { Search, SlidersHorizontal, X, Sparkles, Sprout } from 'lucide-react';

interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon?: string | null;
}

interface DistrictItem {
  id: string;
  nameBn: string;
  nameEn: string;
}

interface Props {
  initialProducts: ProductItem[];
  categories: CategoryItem[];
  districts: DistrictItem[];
}

export function ProductsFilterClient({ initialProducts, categories, districts }: Props) {
  const { language } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [onlyPreOrder, setOnlyPreOrder] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName =
            p.nameBn.toLowerCase().includes(q) ||
            p.nameEn.toLowerCase().includes(q) ||
            p.category?.nameBn.toLowerCase().includes(q) ||
            p.category?.nameEn.toLowerCase().includes(q) ||
            (p.farmerProfile?.fullName && p.farmerProfile.fullName.toLowerCase().includes(q)) ||
            (p.farm?.name && p.farm.name.toLowerCase().includes(q));
          if (!matchName) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category?.nameEn !== selectedCategory && p.category?.nameBn !== selectedCategory && p.category?.id !== selectedCategory) {
            return false;
          }
        }

        // District filter
        if (selectedDistrict !== 'all') {
          if (p.district?.id !== selectedDistrict && p.districtId !== selectedDistrict && p.district?.nameEn !== selectedDistrict) {
            return false;
          }
        }

        // Pre-order filter
        if (onlyPreOrder && !p.expectedHarvestDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerKg - b.pricePerKg;
        if (sortBy === 'price-desc') return b.pricePerKg - a.pricePerKg;
        return 0; // default newest
      });
  }, [initialProducts, search, selectedCategory, selectedDistrict, onlyPreOrder, sortBy]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDistrict !== 'all' ||
    onlyPreOrder ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setOnlyPreOrder(false);
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Search & Main Filter Bar */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'ফসল, জেলা বা কৃষকের নাম দিয়ে খুঁজুন...'
                  : 'Search by crop, district or farmer name...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20 focus:border-[var(--green)]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20 focus:border-[var(--green)]"
            >
              <option value="all">
                {language === 'bn' ? '📍 সকল জেলা (৬৪টি)' : '📍 All Districts (64)'}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'bn' ? d.nameBn : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20 focus:border-[var(--green)]"
            >
              <option value="newest">
                {language === 'bn' ? 'সদ্য তালিকাভুক্ত' : 'Newest First'}
              </option>
              <option value="price-asc">
                {language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}
              </option>
              <option value="price-desc">
                {language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}
              </option>
            </select>
          </div>
        </div>

        {/* Categories Pills & Advance Booking Check */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--card-border)]">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[var(--green)] text-white shadow-sm'
                  : 'bg-[var(--bg)] border border-[var(--card-border)] text-[var(--ink)]/80 hover:bg-[var(--tint)]'
              }`}
            >
              {language === 'bn' ? 'সকল ফসল' : 'All Crops'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--green)] text-white shadow-sm'
                    : 'bg-[var(--bg)] border border-[var(--card-border)] text-[var(--ink)]/80 hover:bg-[var(--tint)]'
                }`}
              >
                <span>{cat.icon || '🌾'}</span>
                <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--ink)] select-none">
              <input
                type="checkbox"
                checked={onlyPreOrder}
                onChange={(e) => setOnlyPreOrder(e.target.checked)}
                className="rounded border-[var(--card-border)] text-[var(--green)] focus:ring-[var(--green)]"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {language === 'bn' ? 'শুধুমাত্র আগাম বুকিং' : 'Advance Booking Only'}
              </span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[var(--down)] hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" />
                <span>{language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear Filters'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
        <span>
          {language === 'bn'
            ? `প্রদর্শন হচ্ছে ${filteredProducts.length} টি ফসল`
            : `Showing ${filteredProducts.length} crops`}
        </span>
        {hasActiveFilters && (
          <span className="inline-flex items-center gap-1 text-[var(--green)] font-medium">
            <SlidersHorizontal className="w-3 h-3" />
            {language === 'bn' ? 'ফিল্টার প্রযোজ্য রয়েছে' : 'Filters Active'}
          </span>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--ink)]">
            {language === 'bn' ? 'কোনো ফসল খুঁজে পাওয়া যায়নি' : 'No crops found matching your filters'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
            {language === 'bn'
              ? 'অন্য কোনো ফসল বা ভিন্ন জেলা নির্বাচন করে আবার চেষ্টা করুন অথবা ফিল্টার রিসেট করুন।'
              : 'Try adjusting your search criteria, selecting another district, or reset your filters.'}
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--green)] text-white text-xs font-bold shadow-sm hover:bg-[var(--green-hover)]"
          >
            {language === 'bn' ? 'সকল ফসল দেখুন' : 'Show All Crops'}
          </button>
        </div>
      )}
    </div>
  );
}
