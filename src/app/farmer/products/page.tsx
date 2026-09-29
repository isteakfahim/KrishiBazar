import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { Plus, ArrowLeft, Package, Edit3, Calendar } from 'lucide-react';
import { FarmerStatusToggle } from '../components/FarmerStatusToggle';
import { DeleteProductButton } from './DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function FarmerProductsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/farmer/products');
  }

  const role = (session.user as { role?: UserRole }).role;
  if (role !== UserRole.FARMER && role !== UserRole.ADMIN) {
    redirect('/');
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const products = farmerProfile
    ? await prisma.product.findMany({
        where: { farmerProfileId: farmerProfile.id },
        include: { category: true, district: true, farm: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
        <div>
          <Link
            href="/farmer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </Link>
          <h1 className="text-3xl font-extrabold font-heading text-[var(--ink)]">
            আমার ফসলের তালিকা
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            আপনার নিবন্ধিত সকল ফসল পরিচালনা, মূল্য পরিবর্তন ও দৃশ্যমানতা নিয়ন্ত্রণ করুন
          </p>
        </div>

        <Link
          href="/farmer/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--green)] text-white text-xs sm:text-sm font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ফসল যোগ করুন</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4">
          <Package className="w-12 h-12 text-[var(--muted)] mx-auto" />
          <h3 className="font-bold text-lg text-[var(--ink)]">কোনো ফসল তালিকাভুক্ত নেই</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            আপনার ক্ষেতের তাজা ফসল সরাসরি ক্রেতাদের কাছে বিক্রির জন্য তালিকাভুক্ত করুন।
          </p>
          <Link
            href="/farmer/products/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)]"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম ফসল যোগ করুন</span>
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--tint)]/50 text-[var(--ink)] font-bold border-b border-[var(--card-border)] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">ফসল ও ছবি</th>
                  <th className="py-4 px-4">ক্যাটাগরি ও জেলা</th>
                  <th className="py-4 px-4">দর (প্রতি কেজি)</th>
                  <th className="py-4 px-4">মজুদ ও নূন্যতম অর্ডার</th>
                  <th className="py-4 px-4">স্ট্যাটাস</th>
                  <th className="py-4 px-6 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-[var(--ink)]">
                {products.map((p) => {
                  const isPreOrder = Boolean(p.expectedHarvestDate);
                  return (
                    <tr key={p.id} className="hover:bg-[var(--tint)]/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[var(--tint)] overflow-hidden shrink-0 flex items-center justify-center text-xl">
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.nameBn} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <span>{p.category.icon || '🌾'}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--ink)]">{p.nameBn}</div>
                            <div className="text-[11px] text-[var(--muted)]">{p.nameEn}</div>
                            {isPreOrder && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>আগাম বুকিং</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[var(--green)]">{p.category.nameBn}</div>
                        <div className="text-[11px] text-[var(--muted)]">📍 {p.district.nameBn}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-base font-black font-heading text-[var(--green)]">
                          ৳{Number(p.pricePerKg).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">/কেজি</span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold">{Number(p.quantityAvailable).toLocaleString()} কেজি</div>
                        <div className="text-[10px] text-[var(--muted)]">
                          নূন্যতম: {Number(p.minimumOrderQty)} কেজি
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <FarmerStatusToggle productId={p.id} initialStatus={p.isAvailable} />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/farmer/products/${p.id}/edit`}
                            className="p-2 rounded-xl border border-[var(--card-border)] hover:bg-[var(--tint)] text-[var(--ink)]"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.nameBn} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
