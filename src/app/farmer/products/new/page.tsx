import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/farmer/products/new');
  }

  const role = (session.user as { role?: UserRole }).role;
  if (role !== UserRole.FARMER && role !== UserRole.ADMIN) {
    redirect('/');
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const categories = await prisma.productCategory.findMany({
    orderBy: { nameEn: 'asc' },
  });

  const districts = await prisma.district.findMany({
    orderBy: { nameEn: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>আমার ফসলের তালিকায় ফিরুন</span>
        </Link>
        <h1 className="text-3xl font-extrabold font-heading text-[var(--ink)]">
          নতুন ফসল যুক্ত করুন
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          লাইভ বাজার দর চার্ট দেখে ন্যায্য মূল্য নির্ধারণ করুন এবং পণ্য তালিকাভুক্ত করুন
        </p>
      </div>

      <ProductForm
        categories={categories}
        districts={districts}
        initialData={
          farmerProfile
            ? {
                nameBn: '',
                nameEn: '',
                categoryId: categories[0]?.id || '',
                districtId: farmerProfile.districtId,
                pricePerKg: 38,
                quantityAvailable: 1000,
                minimumOrderQty: 20,
              }
            : undefined
        }
      />
    </div>
  );
}
