import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import {
  Plus,
  Tractor,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { FarmerStatusToggle } from './components/FarmerStatusToggle';
import { FarmSetupCard } from './components/FarmSetupCard';

export const dynamic = 'force-dynamic';

export default async function FarmerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/farmer');
  }

  const role = (session.user as { role?: UserRole }).role;
  if (role !== UserRole.FARMER && role !== UserRole.ADMIN) {
    redirect('/');
  }

  // Load farmer profile & farms
  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      farms: true,
      district: true,
    },
  });

  const districts = await prisma.district.findMany({
    orderBy: { nameEn: 'asc' },
  });

  // If no farmer profile or farm yet, show farm setup card
  const hasFarm = farmerProfile && farmerProfile.farms.length > 0;

  // Products
  const products = farmerProfile
    ? await prisma.product.findMany({
        where: { farmerProfileId: farmerProfile.id },
        include: { category: true, district: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const activeProducts = products.filter((p) => p.isAvailable);
  const totalStockKg = products.reduce((acc, p) => acc + Number(p.quantityAvailable), 0);

  // Orders
  const orders = farmerProfile
    ? await prisma.order.findMany({
        where: { farmerProfileId: farmerProfile.id },
        include: { buyer: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    : [];

  const newOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const totalSalesTk = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + Number(o.productCost), 0);

  // Market Watch: get current prices for farmer's main categories
  const categoryIds = Array.from(new Set(products.map((p) => p.categoryId)));
  const marketWatchItems = await prisma.priceHistory.findMany({
    where: {
      categoryId: { in: categoryIds },
      districtId: farmerProfile?.districtId,
    },
    include: { category: true },
    orderBy: { date: 'desc' },
    distinct: ['categoryId'],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--tint)] text-[var(--green)]">
            <Tractor className="w-3.5 h-3.5" />
            <span>কৃষক ড্যাশবোর্ড</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
            হ্যালো, {farmerProfile?.fullName || session.user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            {farmerProfile?.district ? `📍 ${farmerProfile.district.nameBn}` : ''}{' '}
            {hasFarm ? `• ${farmerProfile.farms[0].name}` : '• খামার প্রোফাইল'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/farmer/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--tint)] text-[var(--green)] border border-[var(--card-border)] text-xs sm:text-sm font-bold hover:bg-[var(--tint)]/80 transition-all shadow-xs active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডারসমূহ {newOrdersCount > 0 ? `(${newOrdersCount}টি নতুন)` : ''}</span>
          </Link>
          <Link
            href="/farmer/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--green)] text-white text-xs sm:text-sm font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ফসল যোগ করুন</span>
          </Link>
        </div>
      </div>

      {/* If farmer has no farm yet, show farm profile setup card */}
      {!hasFarm && (
        <FarmSetupCard
          districts={districts.map((d) => ({
            id: d.id,
            nameBn: d.nameBn,
            nameEn: d.nameEn,
          }))}
          defaultName={session.user.name || ''}
          defaultPhone={session.user.email || ''}
        />
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">সক্রিয় তালিকাভুক্ত ফসল</span>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {activeProducts.length} <span className="text-xs font-normal text-[var(--muted)]">টি</span>
            </div>
            <span className="text-[11px] text-[var(--green)] font-semibold">
              মোট মজুদ: {totalStockKg.toLocaleString()} কেজি
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--tint)] text-[var(--green)] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <Link
          href="/farmer/orders"
          className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between hover:border-[var(--green)]/50 transition-all cursor-pointer group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--muted)] font-medium">প্রাপ্ত অর্ডারসমূহ</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black font-heading text-[var(--ink)]">
              {newOrdersCount} <span className="text-xs font-normal text-[var(--muted)]">টি পেন্ডিং</span>
            </div>
            <span className="text-[11px] text-[var(--farmer-price)] font-semibold">
              মোট চালান: {orders.length} টি
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[var(--farmer-price)] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">এই মাসের মোট বিক্রয়</span>
            <div className="text-2xl font-black font-heading text-[var(--green)]">
              ৳{totalSalesTk.toLocaleString()}
            </div>
            <span className="text-[11px] text-[var(--muted)]">সরাসরি কৃষক একাউন্ট</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--up)] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Market Watch for Farmer's Crops */}
      {marketWatchItems.length > 0 && (
        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--green)]" />
              <h2 className="text-base font-bold font-heading text-[var(--ink)]">
                আপনার জেলার বাজার দর (মার্কেট ওয়াচ)
              </h2>
            </div>
            <Link
              href="/market-prices"
              className="text-xs font-bold text-[var(--green)] hover:underline flex items-center gap-1"
            >
              <span>বিস্তারিত চার্ট</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {marketWatchItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--card-border)]"
              >
                <div className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <span>{item.category.icon}</span>
                  <span className="font-semibold text-[var(--ink)]">{item.category.nameBn}</span>
                </div>
                <div className="text-lg font-black font-heading text-[var(--green)] mt-1">
                  ৳{Number(item.pricePerKg).toFixed(1)}
                  <span className="text-[10px] text-[var(--muted)] font-normal">/কেজি</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  সর্বশেষ আপডেট: {new Date(item.date).toLocaleDateString('bn-BD')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Products Section (First 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--ink)]">
            আমার ফসলসমূহ ({products.length})
          </h2>
          <Link
            href="/farmer/products"
            className="text-xs font-bold text-[var(--green)] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3">
            <Package className="w-10 h-10 text-[var(--muted)] mx-auto" />
            <h3 className="font-bold text-base text-[var(--ink)]">এখনো কোনো ফসল যুক্ত করেননি</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              আপনার খামারের উৎপাদিত ফসল যুক্ত করুন এবং সরাসরি পাইকারি ও খুচরা ক্রেতাদের কাছে ন্যায্যমূল্যে বিক্রি করুন।
            </p>
            <Link
              href="/farmer/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম ফসল যোগ করুন</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-[var(--green)] flex items-center gap-1">
                      <span>{product.category.icon}</span>
                      <span>{product.category.nameBn}</span>
                    </div>
                    <h3 className="font-bold text-base font-heading text-[var(--ink)] mt-0.5">
                      {product.nameBn}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      মজুদ: {Number(product.quantityAvailable).toLocaleString()} কেজি (নূন্যতম{' '}
                      {Number(product.minimumOrderQty)} কেজি)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-heading text-[var(--green)]">
                      ৳{Number(product.pricePerKg).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] block">/কেজি</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
                  <FarmerStatusToggle
                    productId={product.id}
                    initialStatus={product.isAvailable}
                  />
                  <Link
                    href={`/farmer/products/${product.id}/edit`}
                    className="text-xs font-bold text-[var(--ink)] hover:text-[var(--green)] underline"
                  >
                    সম্পাদনা করুন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
