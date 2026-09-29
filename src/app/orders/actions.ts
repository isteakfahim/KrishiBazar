'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Allows a buyer to cancel their order while it is still PENDING.
 * Restores product stock.
 */
export async function cancelBuyerOrderAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'অননুমোদিত অনুরোধ (Unauthorized).' };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'অর্ডারটি পাওয়া যায়নি (Order not found).' };
    }

    if (order.buyerId !== session.user.id) {
      return { success: false, error: 'আপনি শুধুমাত্র আপনার নিজস্ব অর্ডার বাতিল করতে পারবেন।' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, error: 'শুধুমাত্র অপেক্ষারত (Pending) অর্ডার বাতিল করা সম্ভব।' };
    }

    // Cancel order and restore stock within a transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // Restore items stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/farmer/orders');

    return { success: true };
  } catch (err: unknown) {
    console.error('Cancel order error:', err);
    return { success: false, error: 'অর্ডার বাতিল করার সময় সমস্যা হয়েছে।' };
  }
}

/**
 * Allows a farmer (or admin) to advance or cancel an order assigned to them.
 */
export async function updateFarmerOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'অননুমোদিত অনুরোধ (Unauthorized).' };
  }

  const role = (session.user as { role?: string })?.role;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        farmerProfile: true,
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: 'অর্ডারটি পাওয়া যায়নি।' };
    }

    // Must be Admin or the owner farmer
    const isOwnerFarmer = order.farmerProfile.userId === session.user.id;
    const isAdmin = role === 'ADMIN';

    if (!isOwnerFarmer && !isAdmin) {
      return { success: false, error: 'আপনার এই অর্ডারের স্ট্যাটাস পরিবর্তন করার অনুমতি নেই।' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      // If delivered, mark pending payments as PAID
      if (newStatus === 'DELIVERED') {
        await tx.payment.updateMany({
          where: { orderId, status: 'PENDING' },
          data: { status: 'PAID' },
        });
      }

      // If cancelled by farmer, restore stock
      if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantityAvailable: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/farmer/orders');
    revalidatePath('/farmer');

    return { success: true };
  } catch (err: unknown) {
    console.error('Update order status error:', err);
    return { success: false, error: 'স্ট্যাটাস আপডেট করার সময় সমস্যা হয়েছে।' };
  }
}
