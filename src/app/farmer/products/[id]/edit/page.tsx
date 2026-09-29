import React from 'react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { ProductForm } from '../../ProductForm';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/farmer/products/${id}/edit`);
  }

  const role = (session.user as { role?: UserRole }).role;
  if (role !== UserRole.FARMER && role !== UserRole.ADMIN) {
    redirect('/');
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, district: true },
  });

  if (!product) {
    notFound();
  }

  // STRICT SERVER-SIDE OWNERSHIP ENFORCEMENT
  if (role !== UserRole.ADMIN && product.farmerProfileId !== farmerProfile?.id) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[var(--card-bg)] border border-red-300 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
          অননুমোদিত প্রবেশাধিকার (Forbidden)
        </h2>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          নিরাপত্তা নীতি অনুযায়ী কৃষকরা শুধুমাত্র নিজেদের উৎপাদিত ফসল সম্পাদনা করতে পারেন। এই ফসলটি অন্য একজন কৃষকের তালিকাভুক্ত।
        </p>
        <Link
          href="/farmer/products"
          className="inline-block px-5 py-2.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold"
        >
          আমার ফসলের তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

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
          ফসল সম্পাদনা করুন
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          {product.nameBn} — মূল্য, মজুদ বা ফসলের তথ্য হালনাগাদ করুন
        </p>
      </div>

      <ProductForm
        categories={categories}
        districts={districts}
        isEdit={true}
        initialData={{
          id: product.id,
          nameBn: product.nameBn,
          nameEn: product.nameEn,
          descriptionBn: product.descriptionBn,
          categoryId: product.categoryId,
          districtId: product.districtId,
          pricePerKg: Number(product.pricePerKg),
          quantityAvailable: Number(product.quantityAvailable),
          minimumOrderQty: Number(product.minimumOrderQty),
          expectedHarvestDate: product.expectedHarvestDate?.toISOString() || null,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
