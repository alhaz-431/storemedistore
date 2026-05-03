import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE ORDER
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const { items, shippingAddress, shippingName, shippingPhone } = req.body;

    let totalAmount = 0;

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      totalAmount += medicine.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customerId: userId!,
        totalAmount,
        shippingAddress,
        shippingName,
        shippingPhone,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Order failed", error });
  }
};

// GET MY ORDERS (CUSTOMER)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    include: { items: true },
  });

  res.json(orders);
};

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { items: true },
  });

  res.json(orders);
};