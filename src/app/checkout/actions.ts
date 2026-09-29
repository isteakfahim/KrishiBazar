'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculateTransportQuote } from '@/lib/transport';
import { revalidatePath } from 'next/cache';

export interface CheckoutOrderItemInput {
  productId: string;
  quantity: number;
  pricePerKg: number;
}

export interface CheckoutFarmerGroupInput {
  farmerProfileId: string;
  items: CheckoutOrderItemInput[];
}

export interface PlaceOrderInput {
  recipientName: string;
  recipientPhone: string;
  deliveryDistrictId: string;
  deliveryAddress: string;
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'ROCKET';
  farmerGroups: CheckoutFarmerGroupInput[];
}

export async function placeOrdersAction(input: PlaceOrderInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'অর্ডার করতে অনুগ্রহ করে লগইন করুন (Please login to place orders).' };
  }

  const buyerId = session.user.id;

  if (!input.farmerGroups || input.farmerGroups.length === 0) {
    return { success: false, error: 'ঝুড়িতে কোনো পণ্য নেই (Cart is empty).' };
  }

  if (!input.deliveryDistrictId || !input.deliveryAddress || !input.recipientPhone) {
    return { success: false, error: 'ডেলিভারি ঠিকানা ও ফোন নম্বর প্রদান করুন (Please provide address and phone).' };
  }

  try {
    // 1. Fetch delivery district coordinates
    const destDistrict = await prisma.district.findUnique({
      where: { id: input.deliveryDistrictId },
    });

    if (!destDistrict) {
      return { success: false, error: 'নির্বাচিত ডেলিভারি জেলা পাওয়া যায়নি।' };
    }

    // Fetch vehicle types for matching
    const vehicleTypes = await prisma.vehicleType.findMany();

    const createdOrderIds: string[] = [];

    // 2. Execute within a transaction
    await prisma.$transaction(async (tx) => {
      for (const group of input.farmerGroups) {
        if (!group.items || group.items.length === 0) continue;

        // Fetch products to verify price and stock
        const productIds = group.items.map((i) => i.productId);
        const dbProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
          include: {
            farm: true,
            district: true,
          },
        });

        let groupProductCost = 0;
        let groupTotalWeight = 0;

        // Verify stock and calculate product subtotal
        for (const itemInput of group.items) {
          const product = dbProducts.find((p) => p.id === itemInput.productId);
          if (!product) {
            throw new Error(`পণ্য পাওয়া যায়নি (Product ${itemInput.productId} not found)`);
          }
          if (Number(product.quantityAvailable) < itemInput.quantity) {
            throw new Error(
              `"${product.nameBn}" এর পর্যাপ্ত মজুদ নেই (Requested: ${itemInput.quantity}, Available: ${product.quantityAvailable})`
            );
          }

          groupProductCost += itemInput.quantity * Number(product.pricePerKg);
          groupTotalWeight += itemInput.quantity;
        }

        // Determine farm origin coordinates
        const firstProd = dbProducts[0];
        const originLat = firstProd.farm?.latitude ?? firstProd.district.latitude;
        const originLon = firstProd.farm?.longitude ?? firstProd.district.longitude;

        // Calculate transport freight
        const transportQuote = calculateTransportQuote(
          originLat,
          originLon,
          destDistrict.latitude,
          destDistrict.longitude,
          groupTotalWeight
        );

        const transportCost = transportQuote.estimatedCost;
        const totalAmount = groupProductCost + transportCost;

        // Find closest vehicle type
        const matchedVehicle = vehicleTypes.find((v) => Number(v.maxWeightKg) >= groupTotalWeight) || vehicleTypes[0];

        // Generate unique readable order number
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `KB-${Date.now().toString().slice(-6)}-${randomDigits}`;

        // Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            buyerId,
            farmerProfileId: group.farmerProfileId,
            productCost: groupProductCost,
            transportCost,
            totalAmount,
            status: 'PENDING',
            deliveryAddress: `${input.recipientName} (${input.recipientPhone}), ${input.deliveryAddress}`,
            deliveryDistrictId: input.deliveryDistrictId,
            vehicleTypeId: matchedVehicle?.id ?? null,
            distanceKm: transportQuote.roadDistanceKm,
            items: {
              create: group.items.map((item) => {
                const prod = dbProducts.find((p) => p.id === item.productId)!;
                const unitPrice = Number(prod.pricePerKg);
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice,
                  subtotal: item.quantity * unitPrice,
                };
              }),
            },
            payments: {
              create: {
                amount: totalAmount,
                method: input.paymentMethod,
                status: 'PENDING',
                notes: input.paymentMethod === 'COD' ? 'Cash on Delivery (ক্যাশ অন ডেলিভারি)' : `${input.paymentMethod} Simulated Payment`,
              },
            },
          },
        });

        // Decrement product stock
        for (const itemInput of group.items) {
          await tx.product.update({
            where: { id: itemInput.productId },
            data: {
              quantityAvailable: {
                decrement: itemInput.quantity,
              },
            },
          });
        }

        createdOrderIds.push(order.id);
      }
    });

    revalidatePath('/orders');
    revalidatePath('/products');
    revalidatePath('/farmer');

    return {
      success: true,
      orderCount: createdOrderIds.length,
      orderIds: createdOrderIds,
    };
  } catch (error: unknown) {
    console.error('Order placement error:', error);
    const message = error instanceof Error ? error.message : 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।';
    return { success: false, error: message };
  }
}
