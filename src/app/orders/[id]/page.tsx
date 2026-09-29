import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { OrderDetailClient } from './OrderDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/orders');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      farmerProfile: {
        include: {
          district: true,
        },
      },
      deliveryDistrict: true,
      vehicleType: true,
      items: {
        include: {
          product: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const role = (session.user as { role?: string })?.role;
  const isOwnerBuyer = order.buyerId === session.user.id;
  const isOwnerFarmer = order.farmerProfile.userId === session.user.id;
  const isAdmin = role === 'ADMIN';

  if (!isOwnerBuyer && !isOwnerFarmer && !isAdmin) {
    notFound();
  }

  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    productCost: Number(order.productCost),
    transportCost: Number(order.transportCost),
    totalAmount: Number(order.totalAmount),
    deliveryAddress: order.deliveryAddress,
    distanceKm: order.distanceKm,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    farmer: {
      fullName: order.farmerProfile.fullName,
      phone: order.farmerProfile.phone,
      bio: order.farmerProfile.bio,
      districtBn: order.farmerProfile.district.nameBn,
      districtEn: order.farmerProfile.district.nameEn,
    },
    deliveryDistrict: {
      nameBn: order.deliveryDistrict.nameBn,
      nameEn: order.deliveryDistrict.nameEn,
    },
    vehicleType: order.vehicleType
      ? {
          nameBn: order.vehicleType.nameBn,
          nameEn: order.vehicleType.nameEn,
          ratePerKm: Number(order.vehicleType.ratePerKm),
        }
      : null,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      nameBn: i.product.nameBn,
      nameEn: i.product.nameEn,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
      imageUrl: i.product.imageUrl,
    })),
    payments: order.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
    })),
  };

  return <OrderDetailClient order={formattedOrder} />;
}
