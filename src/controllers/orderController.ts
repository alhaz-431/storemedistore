import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// 🎯 এক্সপ্রেসের Request টাইপকে এক্সটেন্ড করে user প্রপার্টি যুক্ত করা হলো (ts2339 এরর ফিক্স)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const prisma = new PrismaClient();

/**
 * 🎯 CREATE NEW ORDER (CUSTOMER)
 * Route: POST /api/v1/orders
 * Access: Private (Customer Only)
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, totalAmount, shippingName, shippingPhone, shippingAddress } = req.body;

    // 👤 ১. মিডলওয়্যার থেকে আসা কাস্টমার আইডি রিসিভ করা (সেফটি চেকসহ)
    const customerId = req.user?.id; 

    if (!customerId) {
      res.status(401).json({ error: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে! আবার লগইন করুন।" });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "কার্ট খালি! কোনো প্রোডাক্ট পাওয়া যায়নি।" });
      return;
    }

    // 🔥 ২. প্রিজমা ট্রানজেকশন ($transaction) শুরু
    const result = await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      
      for (const item of items) {
        // ডাটাবেস থেকে মেডিসিনের স্টক ও সেলার আইডি চেক
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
          select: { id: true, sellerId: true, stock: true, name: true }
        });

        if (!medicine) {
          throw new Error(`ঔষধটি পাওয়া যায়নি (ID: ${item.medicineId})`);
        }

        // স্টক চেক
        if (medicine.stock < item.quantity) {
          throw new Error(`দুঃখিত, '${medicine.name}' পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${medicine.stock} PCS`);
        }

        // মেডিসিনের স্টক মাইনাস করা
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              decrement: Math.max(1, Number(item.quantity))
            }
          }
        });

        // আপনার স্কিমা অনুযায়ী OrderItem অবজেক্ট অ্যারে প্রিপেয়ার করা (এখানে sellerId বসবে)
        orderItemsData.push({
          medicineId: item.medicineId,
          quantity: Math.max(1, Number(item.quantity)),
          price: Number(item.price),
          sellerId: medicine.sellerId 
        });
      }

      // 💥 মেইন Order এবং OrderItem একসাথে ডাটাবেসে সেভ করা
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          totalAmount: Number(totalAmount),
          shippingName: shippingName.trim(),
          shippingPhone: shippingPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          status: "PENDING", // স্কিমার Enum Default
          customerId: customerId, 
          items: {
            create: orderItemsData 
          }
        },
        include: {
          items: true 
        }
      });

      return newOrder;
    });

    // 🎉 ৩. সাকসেসফুল রেসপন্স
    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: result
    });

  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({ 
      error: error.message || "অর্ডার প্রসেস করার সময় ব্যাকএন্ডে কোনো সমস্যা হয়েছে।" 
    });
  }
};

/**
 * 📦 GET USER ORDERS (CUSTOMER HISTORY)
 * Route: GET /api/v1/orders
 * Access: Private (Customer Only)
 */
export const getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ error: "ইউজার আইডি পাওয়া যায়নি" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customerId },
      include: {
        items: {
          include: {
            medicine: true 
          }
        }
      },
      orderBy: {
        createdAt: "desc" 
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Get Orders Error:", error);
    res.status(500).json({ error: "অর্ডার হিস্ট্রি লোড করতে সমস্যা হয়েছে।" });
  }
};