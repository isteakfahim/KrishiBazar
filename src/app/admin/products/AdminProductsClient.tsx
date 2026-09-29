'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleProductAdminAction, deleteProductAdminAction } from '../actions';
import {
  Search,
  EyeOff,
  Eye,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export interface AdminProductItem {
  id: string;
  nameBn: string;
  nameEn: string;
  pricePerKg: number;
  quantityAvailable: number;
  unit: string;
  isAvailable: boolean;
  imageUrl: string | null;
  category: { nameBn: string; nameEn: string; icon: string | null };
  district: { nameBn: string; nameEn: string };
  farmer: { fullName: string; phone: string };
  farmName: string;
  createdAt: string;
}

export function AdminProductsClient({ initialProducts }: { initialProducts: AdminProductItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredProducts = initialProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.nameBn.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.farmer.fullName.toLowerCase().includes(q) ||
      p.district.nameBn.toLowerCase().includes(q) ||
      p.district.nameEn.toLowerCase().includes(q)
    );
  });

  const handleToggle = async (productId: string, currentStatus: boolean) => {
    setUpdatingId(productId);
    await toggleProductAdminAction(productId, !currentStatus);
    router.refresh();
    setUpdatingId(null);
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    setUpdatingId(productId);
    await deleteProductAdminAction(productId);
    router.refresh();
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ফসল, কৃষক বা জেলার নাম দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
          />
        </div>

        <span className="text-xs text-[var(--muted)]">
          মোট ফসল: {filteredProducts.length} টি
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg)] border-b border-[var(--card-border)] text-[var(--muted)]">
              <tr>
                <th className="py-3 px-4">ফসল</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">কৃষক ও খামার</th>
                <th className="py-3 px-4">জেলা</th>
                <th className="py-3 px-4">দর (টাকা/কেজি)</th>
                <th className="py-3 px-4">মজুদ</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredProducts.map((p) => {
                const isUpdating = updatingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-[var(--bg)]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-lg bg-[var(--tint)] overflow-hidden shrink-0 border border-[var(--card-border)]">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">🌾</div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/products/${p.id}`}
                            className="font-bold text-[var(--ink)] hover:text-[var(--green)] flex items-center gap-1"
                          >
                            <span>{p.nameBn}</span>
                            <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                          </Link>
                          <span className="text-[10px] text-[var(--muted)] block">{p.nameEn}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[var(--muted)]">
                      {p.category.icon} {p.category.nameBn}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[var(--ink)] block">{p.farmer.fullName}</span>
                      <span className="text-[10px] text-[var(--muted)]">{p.farmName}</span>
                    </td>

                    <td className="py-3 px-4 text-[var(--muted)]">{p.district.nameBn}</td>

                    <td className="py-3 px-4 font-bold text-[var(--green)]">৳{p.pricePerKg.toFixed(1)}</td>

                    <td className="py-3 px-4 text-[var(--ink)]">{p.quantityAvailable.toLocaleString()} {p.unit}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isAvailable
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {p.isAvailable ? 'সক্রিয়' : 'লুকানো'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(p.id, p.isAvailable)}
                          disabled={isUpdating}
                          className="p-1.5 rounded-lg border border-[var(--card-border)] hover:bg-[var(--tint)] text-[var(--ink)] transition-colors"
                          title={p.isAvailable ? 'লুকিয়ে রাখুন' : 'সক্রিয় করুন'}
                        >
                          {p.isAvailable ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-[var(--green)]" />}
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.nameBn)}
                          disabled={isUpdating}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
