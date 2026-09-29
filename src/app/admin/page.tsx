import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardOverviewPage() {
  const [
    users,
    products,
    orders,
    priceEntriesCount,
  ] = await Promise.all([
    prisma.user.findMany({ select: { id: true, role: true } }),
    prisma.product.findMany({ select: { id: true, isAvailable: true, pricePerKg: true, quantityAvailable: true } }),
    prisma.order.findMany({
      include: {
        buyer: true,
        farmerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.priceHistory.count(),
  ]);

  // Calculations
  const farmersCount = users.filter((u) => u.role === 'FARMER').length;
  const buyersCount = users.filter((u) => u.role === 'BUYER').length;
  const editorsCount = users.filter((u) => u.role === 'PRICE_EDITOR').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

  const totalProductsCount = products.length;
  const activeProductsCount = products.filter((p) => p.isAvailable).length;

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const totalVolumeTk = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);

  return (
    <div className="space-y-8">
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">নিবন্ধিত ব্যবহারকারী</span>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {users.length} <span className="text-xs font-normal text-[var(--muted)]">জন</span>
            </div>
            <div className="text-[11px] text-[var(--green)] font-semibold">
              {farmersCount} কৃষক • {buyersCount} ক্রেতা
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--tint)] text-[var(--green)] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">তালিকাভুক্ত ফসল</span>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {totalProductsCount} <span className="text-xs font-normal text-[var(--muted)]">টি</span>
            </div>
            <div className="text-[11px] text-[var(--green)] font-semibold">
              {activeProductsCount} টি বিক্রয়ের জন্য সক্রিয়
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--green)] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">মোট সম্পন্ন অর্ডার</span>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {totalOrdersCount} <span className="text-xs font-normal text-[var(--muted)]">টি</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold">
              {pendingOrdersCount} টি প্রক্রিয়াধীন
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">বাজার দর রেকর্ড</span>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {priceEntriesCount.toLocaleString()} <span className="text-xs font-normal text-[var(--muted)]">টি</span>
            </div>
            <div className="text-[11px] text-[var(--muted)]">
              ৬৪ জেলা লাইভ মনিটরিং
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Role Breakdown & Platform Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
            <span>সিস্টেম রোল বিভাজন</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[var(--muted)] block">কৃষক (FARMER)</span>
              <span className="text-lg font-black text-[var(--ink)]">{farmersCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[var(--muted)] block">ক্রেতা (BUYER)</span>
              <span className="text-lg font-black text-[var(--ink)]">{buyersCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[var(--muted)] block">দর নিয়ন্ত্রক (PRICE_EDITOR)</span>
              <span className="text-lg font-black text-[var(--ink)]">{editorsCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]">
              <span className="text-[var(--muted)] block">প্রধান অ্যাডমিন (ADMIN)</span>
              <span className="text-lg font-black text-[var(--ink)]">{adminsCount}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[var(--green)] hover:underline flex items-center gap-1"
            >
              <span>ব্যবহারকারী ও রোল পরিবর্তন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--green)]" />
            <span>প্ল্যাটফর্ম রাজস্ব ও লেনদেন আয়তন</span>
          </h3>

          <div className="p-4 rounded-2xl bg-[var(--tint)]/50 border border-[var(--card-border)] space-y-2">
            <span className="text-xs text-[var(--muted)] block">মোট অর্ডারের সর্বমোট মূল্য</span>
            <div className="text-3xl font-black font-heading text-[var(--green)]">
              ৳{totalVolumeTk.toLocaleString()}
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              ক্যাশ অন ডেলিভারি এবং পরীক্ষামূলক মোবাইল ফিনান্সিয়াল সার্ভিসের মাধ্যমে পরিচালিত।
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
            <span>সিস্টেম স্বাস্থ্য: ১০০% সচল</span>
            <span className="text-[var(--green)] font-bold">PostgreSQL + Prisma Sync</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <h3 className="font-heading font-bold text-base text-[var(--ink)]">
            সাম্প্রতিক চালান ও লেনদেন
          </h3>
          <span className="text-xs text-[var(--muted)]">সর্বশেষ {orders.length}টি অর্ডার</span>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                  <th className="py-2.5 px-3">অর্ডার আইডি</th>
                  <th className="py-2.5 px-3">ক্রেতা</th>
                  <th className="py-2.5 px-3">কৃষক</th>
                  <th className="py-2.5 px-3">মূল্য</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--bg)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[var(--ink)]">
                      <Link href={`/orders/${order.id}`} className="hover:text-[var(--green)]">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-medium text-[var(--ink)]">{order.buyer.name}</td>
                    <td className="py-3 px-3 text-[var(--muted)]">{order.farmerProfile.fullName}</td>
                    <td className="py-3 px-3 font-bold text-[var(--green)]">৳{Number(order.totalAmount).toFixed(1)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--tint)] text-[var(--green)]">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--muted)]">{order.createdAt.toISOString().substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)] text-center py-6">কোনো অর্ডার এখনো রেকর্ড হয়নি।</p>
        )}
      </div>
    </div>
  );
}
