'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';

export async function getFarmerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('অনুগ্রহ করে প্রথমে লগইন করুন।');
  }

  const role = (session.user as { role?: UserRole }).role;
  if (role !== UserRole.FARMER && role !== UserRole.ADMIN) {
    throw new Error('এই কার্যক্রমে প্রবেশের জন্য কৃষক অ্যাকাউন্টে লগইন থাকা আবশ্যক।');
  }

  // Get or auto-initialize farmer profile
  let farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id },
    include: { farms: true, district: true },
  });

  if (!farmerProfile && role === UserRole.FARMER) {
    // Look up default district (e.g. Bogura or Dhaka)
    const defaultDistrict = await prisma.district.findFirst({
      where: { nameEn: 'Bogura' },
    });
    if (defaultDistrict) {
      farmerProfile = await prisma.farmerProfile.create({
        data: {
          userId: session.user.id,
          fullName: session.user.name || 'কৃষক',
          phone: session.user.email || '01700000000',
          districtId: defaultDistrict.id,
        },
        include: { farms: true, district: true },
      });
    }
  }

  return { session, farmerProfile };
}

export async function saveFarmProfile(formData: FormData) {
  const { session } = await getFarmerSession();

  const fullName = String(formData.get('fullName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const bio = String(formData.get('bio') || '').trim();
  const districtId = String(formData.get('districtId') || '').trim();
  const farmName = String(formData.get('farmName') || '').trim();
  const landSize = parseFloat(String(formData.get('landSize') || '0'));
  const landUnit = String(formData.get('landUnit') || 'Bigha').trim();
  const mainCrops = String(formData.get('mainCrops') || '').trim();
  const description = String(formData.get('description') || '').trim();

  if (!fullName || !phone || !districtId || !farmName) {
    throw new Error('নাম, ফোন নম্বর, জেলা এবং খামারের নাম প্রদান করা আবশ্যক।');
  }

  const profile = await prisma.farmerProfile.upsert({
    where: { userId: session.user.id },
    update: {
      fullName,
      phone,
      bio,
      districtId,
    },
    create: {
      userId: session.user.id,
      fullName,
      phone,
      bio,
      districtId,
    },
  });

  // Upsert the main farm
  const existingFarm = await prisma.farm.findFirst({
    where: { farmerProfileId: profile.id },
  });

  if (existingFarm) {
    await prisma.farm.update({
      where: { id: existingFarm.id },
      data: {
        name: farmName,
        landSize: landSize || 1,
        landUnit,
        mainCrops,
        description,
        districtId,
      },
    });
  } else {
    await prisma.farm.create({
      data: {
        farmerProfileId: profile.id,
        name: farmName,
        landSize: landSize || 1,
        landUnit,
        mainCrops,
        description,
        districtId,
      },
    });
  }

  revalidatePath('/farmer');
  revalidatePath('/farmer/products');
  return { success: true };
}

export async function createFarmerProduct(formData: FormData) {
  const { farmerProfile } = await getFarmerSession();
  if (!farmerProfile) {
    throw new Error('অনুগ্রহ করে প্রথমে খামারের তথ্য পূরণ করুন।');
  }

  const nameBn = String(formData.get('nameBn') || '').trim();
  const nameEn = String(formData.get('nameEn') || nameBn).trim();
  const descriptionBn = String(formData.get('descriptionBn') || '').trim();
  const categoryId = String(formData.get('categoryId') || '').trim();
  const districtId = String(formData.get('districtId') || farmerProfile.districtId).trim();
  const farmId = String(formData.get('farmId') || '').trim() || null;
  const pricePerKg = parseFloat(String(formData.get('pricePerKg') || '0'));
  const quantityAvailable = parseFloat(String(formData.get('quantityAvailable') || '0'));
  const minimumOrderQty = parseFloat(String(formData.get('minimumOrderQty') || '1'));
  const isPreOrder = formData.get('isPreOrder') === 'true';
  const expectedHarvestDateStr = String(formData.get('expectedHarvestDate') || '');

  if (!nameBn || !categoryId || !districtId || pricePerKg <= 0 || quantityAvailable <= 0) {
    throw new Error('ফসলের নাম, ক্যাটাগরি, জেলা, সঠিক দর এবং পরিমাণ নির্ধারণ করুন।');
  }

  let imageUrl: string | null = null;
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await storage.uploadImage(imageFile);
  }

  const expectedHarvestDate =
    isPreOrder && expectedHarvestDateStr ? new Date(expectedHarvestDateStr) : null;

  const product = await prisma.product.create({
    data: {
      farmerProfileId: farmerProfile.id,
      farmId,
      categoryId,
      districtId,
      nameBn,
      nameEn,
      descriptionBn,
      pricePerKg,
      quantityAvailable,
      minimumOrderQty: minimumOrderQty || 1,
      unit: 'kg',
      imageUrl,
      expectedHarvestDate,
      isAvailable: true,
    },
  });

  revalidatePath('/farmer');
  revalidatePath('/farmer/products');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true, productId: product.id };
}

export async function updateFarmerProduct(productId: string, formData: FormData) {
  const { session, farmerProfile } = await getFarmerSession();
  const role = (session.user as { role?: UserRole }).role;

  // STRICT SERVER-SIDE OWNERSHIP VALIDATION
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error('পণ্যটি খুঁজে পাওয়া যায়নি।');
  }

  if (role !== UserRole.ADMIN && existingProduct.farmerProfileId !== farmerProfile?.id) {
    throw new Error('অননুমোদিত: আপনি শুধুমাত্র আপনার নিজের তালিকাভুক্ত ফসল সংশোধন করতে পারেন।');
  }

  const nameBn = String(formData.get('nameBn') || '').trim();
  const nameEn = String(formData.get('nameEn') || nameBn).trim();
  const descriptionBn = String(formData.get('descriptionBn') || '').trim();
  const categoryId = String(formData.get('categoryId') || '').trim();
  const districtId = String(formData.get('districtId') || existingProduct.districtId).trim();
  const pricePerKg = parseFloat(String(formData.get('pricePerKg') || '0'));
  const quantityAvailable = parseFloat(String(formData.get('quantityAvailable') || '0'));
  const minimumOrderQty = parseFloat(String(formData.get('minimumOrderQty') || '1'));
  const isPreOrder = formData.get('isPreOrder') === 'true';
  const expectedHarvestDateStr = String(formData.get('expectedHarvestDate') || '');

  if (!nameBn || !categoryId || pricePerKg <= 0 || quantityAvailable < 0) {
    throw new Error('সঠিক নাম, দর ও পরিমাণ প্রদান করুন।');
  }

  let imageUrl: string = existingProduct.imageUrl || '';
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await storage.uploadImage(imageFile);
  }

  const expectedHarvestDate =
    isPreOrder && expectedHarvestDateStr ? new Date(expectedHarvestDateStr) : null;

  await prisma.product.update({
    where: { id: productId },
    data: {
      nameBn,
      nameEn,
      descriptionBn,
      categoryId,
      districtId,
      pricePerKg,
      quantityAvailable,
      minimumOrderQty: minimumOrderQty || 1,
      imageUrl: imageUrl || null,
      expectedHarvestDate,
    },
  });

  revalidatePath('/farmer');
  revalidatePath('/farmer/products');
  revalidatePath(`/farmer/products/${productId}/edit`);
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductAvailability(productId: string) {
  const { session, farmerProfile } = await getFarmerSession();
  const role = (session.user as { role?: UserRole }).role;

  // STRICT SERVER-SIDE OWNERSHIP VALIDATION
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('পণ্যটি পাওয়া যায়নি।');
  }

  if (role !== UserRole.ADMIN && product.farmerProfileId !== farmerProfile?.id) {
    throw new Error('অননুমোদিত: আপনি অন্যের পণ্য পরিবর্তন করতে পারবেন না।');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isAvailable: !product.isAvailable },
  });

  revalidatePath('/farmer');
  revalidatePath('/farmer/products');
  revalidatePath('/products');
  return { success: true, isAvailable: updated.isAvailable };
}

export async function deleteFarmerProduct(productId: string) {
  const { session, farmerProfile } = await getFarmerSession();
  const role = (session.user as { role?: UserRole }).role;

  // STRICT SERVER-SIDE OWNERSHIP VALIDATION
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('পণ্যটি পাওয়া যায়নি।');
  }

  if (role !== UserRole.ADMIN && product.farmerProfileId !== farmerProfile?.id) {
    throw new Error('অননুমোদিত: আপনি অন্যের পণ্য মুছতে পারবেন না।');
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath('/farmer');
  revalidatePath('/farmer/products');
  revalidatePath('/products');
  return { success: true };
}
