import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ ১. Create Order (কাস্টমারের জন্য - ট্রানজেকশন ও স্টক সেফটি সহ)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, shippingName, shippingPhone } = req.body;
    const customerId = req.user?.userId;

    if (!customerId) {
      return res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "কার্ট খালি, অর্ডার করা সম্ভব নয়" });
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    // আইটেম লুপ চালিয়ে ডেটা ভ্যালিডেশন করা
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      
      if (!medicine) {
        return res.status(404).json({ error: `মেডিসিন পাওয়া যায়নি: ${item.medicineId}` });
      }
      
      if (medicine.stock < item.quantity) {
        return res.status(400).json({ error: `${medicine.name} পর্যাপ্ত স্টক নেই (মজুদ আছে: ${medicine.stock}টি)` });
      }

      // ব্যাকএন্ডের রিয়েল প্রাইস দিয়ে টোটাল অ্যামাউন্ট হিসাব করা (সিকিউরিটি চেক)
      totalAmount += medicine.price * item.quantity;
      
      orderItems.push({ 
        medicineId: item.medicineId, 
        quantity: item.quantity, 
        price: medicine.price,
        sellerId: medicine.sellerId 
      });
    }

    // 🔥 Prisma $transaction ব্যবহার করা হয়েছে যেন অর্ডার তৈরি ও স্টক একসাথে আপডেট হয়
    const order = await prisma.$transaction(async (tx) => {
      // ক) ডাটাবেসে মেইন অর্ডার এবং রিলেশনাল আইটেম তৈরি
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          customerId,
          totalAmount,
          shippingAddress,
          shippingName,
          shippingPhone,
          items: {
            create: orderItems.map((item) => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              price: item.price,
              sellerId: item.sellerId
            }))
          },
        },
        include: { items: true },
      });

      // খ) সফলভাবে অর্ডার তৈরি হলে লুপ চালিয়ে স্টক কমিয়ে দেওয়া
      for (const item of orderItems) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return res.status(201).json({ success: true, message: "অর্ডার সফল!", data: order });
  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    return res.status(500).json({ error: "অর্ডার ব্যর্থ", details: error.message });
  }
};

// ✅ ২. Get My Orders (লগইন করা কাস্টমারের নিজের অর্ডারগুলো)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.userId;
    
    if (!customerId) {
      return res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি" });
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { medicine: true } } },
      orderBy: { createdAt: "desc" },
    });
    
    return res.json(orders);
  } catch (error) {
    console.error("❌ Get My Orders Error:", error);
    return res.status(500).json({ error: "অর্ডার লোড করা যায়নি" });
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
    return res.json(orders);
  } catch (error) {
    console.error("❌ Get All Orders Error:", error);
    return res.status(500).json({ error: "সব অর্ডার লোড করা যায়নি" });
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
    return res.json(order);
  } catch (error) {
    console.error("❌ Get Single Order Error:", error);
    return res.status(500).json({ error: "অর্ডার লোড ব্যর্থ" });
  }
};

// ✅ ৫. Update Order Status (সেলার যখন স্ট্যাটাস পরিবর্তন করবে)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

    return res.status(200).json({ 
      success: true, 
      message: `অর্ডার এখন ${finalStatus}`, 
      data: updatedOrder 
    });
  } catch (error: any) {
    console.error("❌ Update Order Error:", error);
    return res.status(500).json({ error: "স্ট্যাটাস আপডেট ব্যর্থ", details: error.message });
  }
};