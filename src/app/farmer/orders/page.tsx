import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FarmerOrdersClient, FarmerOrderRow } from './FarmerOrdersClient';
import { ArrowLeft, Tractor, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FarmerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/farmer/orders');
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!farmerProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 mx-auto text-amber-600" />
        <h2 className="text-2xl font-bold font-heading text-[var(--ink)]">
          কৃষক প্রোফাইল পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[var(--muted)]">
          অর্ডার পরিচালনা করতে অনুগ্রহ করে প্রথমে আপনার কৃষক প্রোফাইল সম্পন্ন করুন।
        </p>
        <Link
          href="/farmer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold"
        >
          <span>ফার্মার ড্যাশবোর্ডে যান</span>
        </Link>
      </div>
    );
  }

  const dbOrders = await prisma.order.findMany({
    where: { farmerProfileId: farmerProfile.id },
    include: {
      buyer: true,
      deliveryDistrict: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedOrders: FarmerOrderRow[] = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    productCost: Number(o.productCost),
    transportCost: Number(o.transportCost),
    totalAmount: Number(o.totalAmount),
    deliveryAddress: o.deliveryAddress,
    distanceKm: o.distanceKm,
    createdAt: o.createdAt.toISOString(),
    buyer: {
      name: o.buyer.name,
      phone: o.buyer.phone,
    },
    deliveryDistrict: {
      nameBn: o.deliveryDistrict.nameBn,
      nameEn: o.deliveryDistrict.nameEn,
    },
    items: o.items.map((i) => ({
      id: i.id,
      nameBn: i.product.nameBn,
      nameEn: i.product.nameEn,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div>
          <Link
            href="/farmer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ফার্মার ড্যাশবোর্ডে ফিরুন</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)] flex items-center gap-2">
            <Tractor className="w-7 h-7 text-[var(--green)]" />
            <span>খামারের প্রাপ্ত অর্ডার ও চালান</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            ক্রেতাদের চাহিদা যাচাই করুন এবং অর্ডার নিশ্চিতকরণ ও পরিবহনে প্রেরণের স্ট্যাটাস আপডেট করুন।
          </p>
        </div>

        <span className="text-xs px-3.5 py-1.5 rounded-full bg-[var(--tint)] text-[var(--green)] font-bold self-start sm:self-auto border border-[var(--card-border)]">
          মোট চালান: {formattedOrders.length} টি
        </span>
      </div>

      <FarmerOrdersClient initialOrders={formattedOrders} />
    </div>
  );
}
