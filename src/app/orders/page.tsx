import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { OrdersListClient, BuyerOrderSummary } from './OrdersListClient';
import { ShoppingBag, ArrowLeft, LogIn } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-[var(--ink)]">
          অর্ডার দেখতে লগইন করুন
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
          আপনার ক্রয়কৃত ফসলের লাইভ ডেলিভারি স্ট্যাটাস ও ট্র্যাকিং দেখতে আপনার অ্যাকাউন্টে প্রবেশ করুন।
        </p>
        <div>
          <Link
            href="/login?callbackUrl=/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold"
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন করুন</span>
          </Link>
        </div>
      </div>
    );
  }

  const dbOrders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      farmerProfile: {
        include: {
          district: true,
        },
      },
      deliveryDistrict: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedOrders: BuyerOrderSummary[] = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    productCost: Number(o.productCost),
    transportCost: Number(o.transportCost),
    totalAmount: Number(o.totalAmount),
    distanceKm: o.distanceKm,
    createdAt: o.createdAt.toISOString(),
    farmer: {
      fullName: o.farmerProfile.fullName,
      phone: o.farmerProfile.phone,
      districtBn: o.farmerProfile.district.nameBn,
      districtEn: o.farmerProfile.district.nameEn,
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
      imageUrl: i.product.imageUrl,
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমে ফিরুন</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--ink)]">
            আমার অর্ডার ও চালান
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            কৃষকদের সাথে সম্পন্নকৃত সরাসরি চালানের বিস্তারিত তথ্য ও বর্তমান অবস্থান
          </p>
        </div>

        <span className="text-xs px-3.5 py-1.5 rounded-full bg-[var(--tint)] text-[var(--green)] font-bold self-start sm:self-auto border border-[var(--card-border)]">
          মোট অর্ডার: {formattedOrders.length} টি
        </span>
      </div>

      <OrdersListClient initialOrders={formattedOrders} />
    </div>
  );
}
