'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart } from '@/lib/cart/CartContext';
import { motion } from 'framer-motion';
import {
  MapPin,
  Tractor,
  Calendar,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

export interface ProductItem {
  id: string;
  nameBn: string;
  nameEn: string;
  pricePerKg: number;
  quantityAvailable: number;
  unit: string;
  minimumOrderQty: number;
  expectedHarvestDate?: string | null;
  imageUrl?: string | null;
  districtId?: string;
  district: { id?: string; nameBn: string; nameEn: string };
  category: { id?: string; nameBn: string; nameEn: string; icon?: string | null };
  farmerProfile?: {
    id?: string;
    fullName: string;
    phone?: string;
  } | null;
  farm?: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

export function ProductCard({ product }: { product: ProductItem }) {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      nameBn: product.nameBn,
      nameEn: product.nameEn,
      pricePerKg: product.pricePerKg,
      quantity: product.minimumOrderQty || 1,
      minimumOrderQty: product.minimumOrderQty || 1,
      availableStock: product.quantityAvailable,
      unit: product.unit || 'kg',
      imageUrl: product.imageUrl,
      farmerProfileId: product.farmerProfile?.id || '',
      farmerName: product.farmerProfile?.fullName || 'Farmer',
      farmName: product.farm?.name || 'Farm',
      farmDistrictId: product.districtId || product.district.id || '',
      farmDistrictNameBn: product.district.nameBn,
      farmDistrictNameEn: product.district.nameEn,
      farmLatitude: product.farm?.latitude ?? undefined,
      farmLongitude: product.farm?.longitude ?? undefined,
      expectedHarvestDate: product.expectedHarvestDate,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isPreOrder = Boolean(product.expectedHarvestDate);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition-colors group"
    >
      <div>
        {/* Product Image & Badges */}
        <Link href={`/products/${product.id}`} className="block relative w-full h-48 bg-[var(--tint)] overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={language === 'bn' ? product.nameBn : product.nameEn}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {product.category?.icon || '🌾'}
            </div>
          )}

          {/* District Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-[var(--card-bg)]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[var(--ink)] shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
            <span>{language === 'bn' ? product.district.nameBn : product.district.nameEn}</span>
          </div>

          {/* Pre-order or Advance Listing Tag */}
          {isPreOrder && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
              <Calendar className="w-3 h-3" />
              <span>{t.products.advanceBooking}</span>
            </div>
          )}
        </Link>

        {/* Product Body */}
        <div className="p-5">
          {/* Category Pill */}
          <div className="text-[11px] font-bold text-[var(--green)] uppercase tracking-wider mb-1 flex items-center gap-1">
            <span>{product.category?.icon}</span>
            <span>{language === 'bn' ? product.category.nameBn : product.category.nameEn}</span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--ink)] line-clamp-1 group-hover:text-[var(--green)] transition-colors">
              {language === 'bn' ? product.nameBn : product.nameEn}
            </h3>
          </Link>

          {/* Farmer & Farm Information */}
          <div className="mt-2 text-xs text-[var(--muted)] space-y-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <Tractor className="w-3.5 h-3.5 text-[var(--green)] shrink-0" />
              <span className="font-medium text-[var(--ink)] truncate">
                {product.farm?.name || (language === 'bn' ? 'স্বত্বাধিকারী খামার' : 'Verified Farm')}
              </span>
            </div>
            <div className="text-[11px] pl-5">
              {product.farmerProfile?.fullName}
            </div>
          </div>

          {/* Stock & Minimum Order info */}
          <div className="mt-3 pt-3 border-t border-[var(--card-border)] grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
            <div>
              <span className="block text-[10px] text-[var(--muted)]">{t.products.stock}</span>
              <span className="font-bold text-[var(--ink)]">
                {product.quantityAvailable.toLocaleString()} {product.unit}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--muted)]">{t.products.minOrder}</span>
              <span className="font-bold text-[var(--ink)]">
                {product.minimumOrderQty} {product.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Price & Action */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
          <div>
            <span className="text-[10px] text-[var(--muted)] block">{t.products.price}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black font-heading text-[var(--green)]">
                ৳{Number(product.pricePerKg).toFixed(1)}
              </span>
              <span className="text-xs text-[var(--muted)]">{t.products.perKg}</span>
            </div>
          </div>

          {/* Add to Cart / Order button with micro-animation */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--green)] text-white hover:bg-[var(--green-hover)]'
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'যোগ হয়েছে!' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.products.orderNow}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
