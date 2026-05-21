import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
    const customerId = req.user?.id; 

    if (!customerId) {
      res.status(401).json({ success: false, message: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে! আবার লগইন করুন।" });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "কার্ট খালি! কোনো প্রোডাক্ট পাওয়া যায়নি।" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      
      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId || item.id },
          select: { id: true, sellerId: true, stock: true, name: true }
        });

        if (!medicine) {
          throw new Error(`ঔষধটি পাওয়া যায়নি`);
        }

        if (medicine.stock < Number(item.quantity)) {
          throw new Error(`দুঃখিত, '${medicine.name}' পর্যাপ্ত স্টক নেই।`);
        }

        await tx.medicine.update({
          where: { id: medicine.id },
          data: {
            stock: {
              decrement: Math.max(1, Number(item.quantity))
            }
          }
        });

        orderItemsData.push({
          medicineId: medicine.id,
          quantity: Math.max(1, Number(item.quantity)),
          price: Number(item.price),
          sellerId: medicine.sellerId 
        });
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          totalAmount: Number(totalAmount),
          shippingName: (shippingName || "Customer").trim(),
          shippingPhone: (shippingPhone || "").trim(),
          shippingAddress: (shippingAddress || "").trim(),
          status: "PENDING", 
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

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: result
    });

  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    res.status(400).json({ 
      success: false,
      message: error.message || "অর্ডার প্রসেস করার সময় সমস্যা হয়েছে।" 
    });
  }
};

/**
 * 📦 GET USER ORDERS (CUSTOMER)
 * Route: GET /api/v1/orders/my
 * Access: Private (Customer Only)
 */
export const getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ success: false, message: "ইউজার আইডি পাওয়া যায়নি" });
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
    res.status(500).json({ success: false, message: "অর্ডার হিস্ট্রি লোড করতে সমস্যা হয়েছে।" });
  }
};

/**
 * ❌ CANCEL ORDER (CUSTOMER)
 * Route: PATCH /api/v1/orders/:id
 * Access: Private (Customer Only)
 */
export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    const customerId = req.user?.id; 

    if (!customerId) {
      res.status(401).json({ success: false, message: "ইউজার অথেনটিকেশন ব্যর্থ হয়েছে!" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "অর্ডারটি খুঁজে পাওয়া যায়নি!" });
      return;
    }

    if (order.customerId !== customerId) {
      res.status(403).json({ success: false, message: "আপনার এই অর্ডারটি বাতিল করার অনুমতি নেই!" });
      return;
    }

    if (order.status === "CANCELLED") {
      res.status(400).json({ success: false, message: "অর্ডারটি ইতিমধ্যে বাতিল করা হয়েছে।" });
      return;
    }
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      res.status(400).json({ success: false, message: "দুঃখিত, অর্ডারটি ইতিমধ্যে শিপড বা ডেলিভারি হয়ে গেছে!" });
      return;
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: id },
        data: { status: "CANCELLED" }
      });

      return updatedOrder;
    });

    res.status(200).json({
      success: true,
      message: "অর্ডারটি সফলভাবে বাতিল করা হয়েছে এবং স্টক রিফান্ড করা হয়েছে!",
      order: cancelledOrder
    });

  } catch (error: any) {
    console.error("❌ Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "সার্ভার সমস্যা।" });
  }
};

/**
 * 🔍 GET SINGLE ORDER (CUSTOMER/ADMIN)
 * Route: GET /api/v1/orders/:id
 */
export const getSingleOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "অর্ডার পাওয়া যায়নি" });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👑 GET ALL ORDERS (ADMIN ONLY)
 * Route: GET /api/v1/orders
 */
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👑 UPDATE ORDER STATUS (ADMIN ONLY)
 * Route: PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, SHIPPED, DELIVERED, CANCELLED etc.

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, message: "অর্ডারের স্ট্যাটাস আপডেট হয়েছে", data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};