'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, PriceSource } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function checkAdminOrEditor() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('অননুমোদিত অনুরোধ (Unauthorized).');
  }
  const role = (session.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN && role !== UserRole.PRICE_EDITOR) {
    throw new Error('এই কাজের জন্য অ্যাডমিন বা দর নিয়ন্ত্রক অনুমতি প্রয়োজন।');
  }
  return { session, role };
}

async function checkAdminOnly() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('অননুমোদিত অনুরোধ (Unauthorized).');
  }
  const role = (session.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN) {
    throw new Error('এই কাজের জন্য শুধুমাত্র অ্যাডমিন অনুমতি প্রযোজ্য।');
  }
  return session;
}

export interface RecordPriceInput {
  categoryId: string;
  districtId: string;
  pricePerKg: number;
  dateStr: string; // YYYY-MM-DD
  source?: PriceSource;
  overrideDeviation?: boolean;
}

/**
 * Record a single daily price with >50% deviation warning
 */
export async function recordDailyPriceAction(input: RecordPriceInput) {
  try {
    const { session } = await checkAdminOrEditor();

    if (!input.categoryId || !input.districtId || !input.pricePerKg || !input.dateStr) {
      return { success: false, error: 'সকল তথ্য সঠিকভাবে পূরণ করুন।' };
    }

    const targetDate = new Date(input.dateStr);
    const newPrice = Number(input.pricePerKg);

    // 1. Check previous day or most recent price to test for >50% deviation
    const prevEntry = await prisma.priceHistory.findFirst({
      where: {
        categoryId: input.categoryId,
        districtId: input.districtId,
        date: { lt: targetDate },
      },
      orderBy: { date: 'desc' },
    });

    if (prevEntry) {
      const prevPrice = Number(prevEntry.pricePerKg);
      if (prevPrice > 0) {
        const diffPercent = Math.abs((newPrice - prevPrice) / prevPrice) * 100;
        if (diffPercent > 50 && !input.overrideDeviation) {
          return {
            success: false,
            needsConfirmation: true,
            deviationPercent: Math.round(diffPercent),
            prevPrice,
            newPrice,
            message: `সতর্কতা: নতুন দর (৳${newPrice}) পূর্ববর্তী দর (৳${prevPrice}) থেকে ${Math.round(diffPercent)}% পরিবর্তিত হয়েছে। সংরক্ষণ করতে সম্মতি দিন।`,
          };
        }
      }
    }

    const source = input.source || PriceSource.ADMIN;

    // Upsert into PriceHistory
    await prisma.priceHistory.upsert({
      where: {
        categoryId_districtId_date_source: {
          categoryId: input.categoryId,
          districtId: input.districtId,
          date: targetDate,
          source,
        },
      },
      update: {
        pricePerKg: newPrice,
        enteredById: session.user.id,
      },
      create: {
        categoryId: input.categoryId,
        districtId: input.districtId,
        date: targetDate,
        pricePerKg: newPrice,
        source,
        enteredById: session.user.id,
        isDemo: false,
      },
    });

    revalidatePath('/market-prices');
    revalidatePath('/prices');
    revalidatePath('/admin/prices');

    return { success: true };
  } catch (err: unknown) {
    console.error('Record price error:', err);
    const msg = err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ হয়েছে।';
    return { success: false, error: msg };
  }
}

export interface CSVPriceRow {
  date: string; // YYYY-MM-DD
  category: string; // slug, nameEn, or nameBn
  district: string; // nameEn or nameBn
  price: number;
}

/**
 * Bulk upload prices from CSV rows
 */
export async function bulkUploadPricesAction(rows: CSVPriceRow[]) {
  try {
    const { session } = await checkAdminOrEditor();

    if (!rows || rows.length === 0) {
      return { success: false, error: 'কোনো বৈধ সারি পাওয়া যায়নি।' };
    }

    const [categories, districts] = await Promise.all([
      prisma.productCategory.findMany(),
      prisma.district.findMany(),
    ]);

    let insertedCount = 0;
    let errorCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        if (!row.date || !row.category || !row.district || !row.price) {
          errorCount++;
          continue;
        }

        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          errorCount++;
          continue;
        }

        const catQuery = row.category.trim().toLowerCase();
        const matchedCategory = categories.find(
          (c) =>
            c.slug.toLowerCase() === catQuery ||
            c.nameEn.toLowerCase() === catQuery ||
            c.nameBn === row.category.trim()
        );

        const distQuery = row.district.trim().toLowerCase();
        const matchedDistrict = districts.find(
          (d) =>
            d.nameEn.toLowerCase() === distQuery ||
            d.nameBn === row.district.trim()
        );

        if (!matchedCategory || !matchedDistrict) {
          errorCount++;
          continue;
        }

        await tx.priceHistory.upsert({
          where: {
            categoryId_districtId_date_source: {
              categoryId: matchedCategory.id,
              districtId: matchedDistrict.id,
              date,
              source: PriceSource.ADMIN,
            },
          },
          update: {
            pricePerKg: Number(row.price),
            enteredById: session.user.id,
          },
          create: {
            categoryId: matchedCategory.id,
            districtId: matchedDistrict.id,
            date,
            pricePerKg: Number(row.price),
            source: PriceSource.ADMIN,
            enteredById: session.user.id,
            isDemo: false,
          },
        });

        insertedCount++;
      }
    });

    revalidatePath('/market-prices');
    revalidatePath('/prices');
    revalidatePath('/admin/prices');

    return {
      success: true,
      insertedCount,
      errorCount,
    };
  } catch (err: unknown) {
    console.error('Bulk upload error:', err);
    const msg = err instanceof Error ? err.message : 'সিএসভি আপলোড ব্যর্থ হয়েছে।';
    return { success: false, error: msg };
  }
}

/**
 * Switch user role (ADMIN only)
 */
export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    await checkAdminOnly();

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    console.error('Update user role error:', err);
    const msg = err instanceof Error ? err.message : 'রোল পরিবর্তন ব্যর্থ হয়েছে।';
    return { success: false, error: msg };
  }
}

/**
 * Toggle product availability or hide (ADMIN only)
 */
export async function toggleProductAdminAction(productId: string, isAvailable: boolean) {
  try {
    await checkAdminOnly();

    await prisma.product.update({
      where: { id: productId },
      data: { isAvailable },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (err: unknown) {
    console.error('Toggle product error:', err);
    const msg = err instanceof Error ? err.message : 'পণ্য স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।';
    return { success: false, error: msg };
  }
}

/**
 * Delete product (ADMIN only)
 */
export async function deleteProductAdminAction(productId: string) {
  try {
    await checkAdminOnly();

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (err: unknown) {
    console.error('Delete product error:', err);
    const msg = err instanceof Error ? err.message : 'পণ্য মুছে ফেলতে ব্যর্থ হয়েছে।';
    return { success: false, error: msg };
  }
}
