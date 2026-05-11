import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ Create Order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    console.log("📦 Create Order Request:", req.body);
    
    const { items, shippingAddress, shippingName, shippingPhone } = req.body;
    const customerId = req.user?.userId;

    if (!customerId) {
      return res.status(401).json({ error: "Customer ID not found" });
    }

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!shippingAddress?.trim()) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    let totalAmount = 0; // 👈 পরিবর্তন ১: totalPrice কে totalAmount করলাম
    const orderItems: any[] = [];

    // Validate each item and calculate total
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return res.status(404).json({ 
          error: `Medicine not found: ${item.medicineId}` 
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}` 
        });
      }

      totalAmount += medicine.price * item.quantity; // 👈 পরিবর্তন ২: এখানেও totalAmount
      orderItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    // Create order with full address
    const fullAddress = shippingName && shippingPhone 
      ? `${shippingName}\n${shippingPhone}\n${shippingAddress}`
      : shippingAddress;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`, // ✅ এটা এখন স্কিমা অনুযায়ী কাজ করবে
        customerId,
        totalAmount, // 👈 পরিবর্তন ৩: স্কিমাতে totalAmount আছে, তাই এটাই দিতে হবে
        shippingAddress: fullAddress,
        shippingName: shippingName || "N/A", // স্কিমাতে shippingName required, তাই N/A দিলাম
        shippingPhone: shippingPhone || "N/A", // স্কিমাতে shippingPhone required
        items: {
          createMany: {
            data: orderItems,
          },
        },
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update stock for each medicine
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

    console.log("✅ Order created successfully:", order.id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
    });
  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
};

// ... বাকি ফাংশনগুলো (getCustomerOrders, getOrderById, cancelOrder) একই থাকবে