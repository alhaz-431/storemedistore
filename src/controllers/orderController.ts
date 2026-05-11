import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ ১. Create Order (অর্ডার তৈরি করা)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, shippingName, shippingPhone } = req.body;
    const customerId = req.user?.userId;

    if (!customerId) {
      return res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি" });
    }

    // ভ্যালিডেশন
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "কার্ট খালি, অর্ডার করা সম্ভব নয়" });
    }

    if (!shippingAddress || !shippingName || !shippingPhone) {
      return res.status(400).json({ error: "নাম, ফোন নম্বর এবং ঠিকানা আবশ্যক" });
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    // প্রতিটি আইটেম চেক করা এবং স্টক ভ্যালিডেশন
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return res.status(404).json({ error: `মেডিসিন পাওয়া যায়নি: ${item.medicineId}` });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({ 
          error: `${medicine.name} এর পর্যাপ্ত স্টক নেই। আছে: ${medicine.stock}` 
        });
      }

      totalAmount += medicine.price * item.quantity;
      orderItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    // ডাটাবেজে অর্ডার তৈরি
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`, // ইউনিক অর্ডার নম্বর
        customerId,
        totalAmount,
        shippingAddress,
        shippingName,
        shippingPhone,
        items: {
          createMany: {
            data: orderItems,
          },
        },
      },
      include: {
        items: true,
      },
    });

    // স্টক আপডেট (কমানো)
    for (const item of items) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json({ success: true, message: "অর্ডার সফল হয়েছে!", data: order });
  } catch (error: any) {
    console.error("❌ Order Error:", error);
    res.status(500).json({ error: "অর্ডার করা যায়নি", details: error.message });
  }
};

// ✅ ২. Get My Orders (কাস্টমারের নিজের অর্ডার দেখা)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.userId;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { medicine: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "অর্ডার লিস্ট লোড হয়নি" });
  }
};

// ✅ ৩. Get All Orders (অ্যাডমিনের জন্য সব অর্ডার)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        items: { include: { medicine: true } },
        customer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "সব অর্ডার লোড করা যায়নি" });
  }
};