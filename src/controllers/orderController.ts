import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const createOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const {
      items,
      shippingAddress,
      shippingName,
      shippingPhone,
    } = req.body;

    // ❌ validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    // ✅ validate + calculate total
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${medicine.name}`,
        });
      }

      totalAmount += medicine.price * item.quantity;
    }

    // ✅ create order
    const order = await prisma.order.create({
      data: {
        customerId: userId, // ✅ FIXED (IMPORTANT)
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
        items: {
          include: {
            medicine: true,
          },
        },
        customer: true,
      },
    });

    // ✅ reduce stock after order success
    for (const item of items) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order failed", err });
  }
};