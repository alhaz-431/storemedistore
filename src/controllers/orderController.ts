import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ ১. Create Order (কাস্টমারের জন্য)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, shippingName, shippingPhone } = req.body;
    const customerId = req.user?.userId;

    if (!customerId) return res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি" });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "কার্ট খালি, অর্ডার করা সম্ভব নয়" });
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    // আইটেম লুপ চালিয়ে ডেটা প্রসেস করা
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      
      if (!medicine) return res.status(404).json({ error: `মেডিসিন নেই: ${item.medicineId}` });
      if (medicine.stock < item.quantity) return res.status(400).json({ error: `${medicine.name} স্টক আউট` });

      totalAmount += medicine.price * item.quantity;
      
      // ✅ এখানে sellerId অবশ্যই দিতে হবে নাহলে Prisma এরর দিবে
      orderItems.push({ 
        medicineId: item.medicineId, 
        quantity: item.quantity, 
        price: medicine.price,
        sellerId: medicine.sellerId 
      });
    }

    // ডাটাবেসে অর্ডার তৈরি
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId,
        totalAmount,
        shippingAddress,
        shippingName,
        shippingPhone,
        items: { createMany: { data: orderItems } },
      },
      include: { items: true },
    });

    // সফলভাবে অর্ডার হলে স্টক কমিয়ে দেওয়া
    for (const item of items) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json({ success: true, message: "অর্ডার সফল!", data: order });
  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({ error: "অর্ডার ব্যর্থ", details: error.message });
  }
};

// ✅ ২. Get My Orders (লগইন করা কাস্টমারের নিজের অর্ডারগুলো)
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
    res.status(500).json({ error: "অর্ডার লোড করা যায়নি" });
  }
};

// ✅ ৩. Get All Orders (সেলার এবং অ্যাডমিনের জন্য)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        items: { include: { medicine: true } },
        customer: { select: { name: true, email: true, image: true } } 
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "সব অর্ডার লোড করা যায়নি" });
  }
};

// ✅ ৪. Get Single Order (অর্ডারের ডিটেইলস দেখা)
export const getSingleOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; 
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        items: { include: { medicine: true } },
        customer: { select: { name: true, email: true, image: true } }
      },
    });
    if (!order) return res.status(404).json({ error: "অর্ডার পাওয়া যায়নি" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "অর্ডার লোড ব্যর্থ" });
  }
};

// ✅ ৫. Update Order Status (সেলার যখন স্ট্যাটাস পরিবর্তন করবে)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ফ্রন্টএন্ড থেকে { status: "SHIPPED" } এভাবে আসবে

    if (!status) return res.status(400).json({ error: "স্ট্যাটাস পাঠানো হয়নি" });

    const finalStatus = status.toUpperCase();
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!validStatuses.includes(finalStatus)) {
      return res.status(400).json({ error: "ভুল স্ট্যাটাস ফরম্যাট" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: finalStatus as any },
    });

    res.status(200).json({ 
      success: true, 
      message: `অর্ডার এখন ${finalStatus}`, 
      data: updatedOrder 
    });
  } catch (error: any) {
    console.error("❌ Update Order Error:", error);
    res.status(500).json({ error: "স্ট্যাটাস আপডেট ব্যর্থ", details: error.message });
  }
};