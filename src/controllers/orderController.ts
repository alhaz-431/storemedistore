// src/controllers/orderController.ts

import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ১. নতুন অর্ডার তৈরি
export const createOrder = async (orderData: any, customerId: string) => {
  const { items, shippingAddress, shippingName, shippingPhone } = orderData;

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    for (const item of items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: item.medicineId }
      });

      if (!medicine || medicine.stock < item.quantity) {
        throw new Error(`${medicine?.name || 'Medicine'} পর্যাপ্ত স্টকে নেই!`);
      }

      totalAmount += medicine.price * item.quantity;

      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return await tx.order.create({
      data: {
        customerId,
        totalAmount,
        shippingAddress,
        shippingName,
        shippingPhone,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true }
    });
  });
};

// ২. ইউজার অর্ডার লিস্ট
export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { customerId: userId },
    include: { items: { include: { medicine: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

// ৩. সিঙ্গেল অর্ডার ডিটেইলস
export const getOrderById = async (id: string) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { medicine: true } },
      customer: { select: { name: true, email: true } }
    }
  });
};

// ৪. অ্যাডমিনের জন্য সব অর্ডার
export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: { customer: { select: { name: true, email: true } }, items: true },
    orderBy: { createdAt: 'desc' }
  });
};

// ৫. অর্ডার স্ট্যাটাস আপডেট
export const updateOrderStatus = async (id: string, status: string) => {
  return await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus }
  });
};