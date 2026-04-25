import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  const { customerId, items, shippingAddress, shippingName, shippingPhone } = req.body;

  try {
    // প্রিজমা ট্রানজেকশন শুরু
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // ১. প্রতিটি আইটেমের স্টক চেক করা এবং প্রাইস ক্যালকুলেট করা
      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });

        if (!medicine || medicine.stock < item.quantity) {
          throw new Error(`${medicine?.name || 'Medicine'} পর্যাপ্ত স্টকে নেই!`);
        }

        totalAmount += medicine.price * item.quantity;

        // ২. স্টক কমিয়ে দেওয়া
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // ৩. মেইন অর্ডার ক্রিয়েট করা
      const order = await tx.order.create({
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
              price: item.price // অর্ডার করার সময়কার দাম
            }))
          }
        },
        include: { items: true }
      });

      return order;
    });

    res.status(201).json({ message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!", data: result });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  // টাইপ কাস্টিং করে বলে দিন এটা স্ট্রিং-ই হবে
  const userId = req.params.userId as string; 

  try {
    const orders = await prisma.order.findMany({
      where: { 
        customerId: userId // এখন টাইপস্ক্রিপ্ট আর এরর দিবে না
      },
      include: {
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'অর্ডার লিস্ট আনতে সমস্যা হয়েছে!' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  // স্পষ্ট করে বলে দিন যে id একটি string হবে
  const id = req.params.id as string;

  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: id // এখন টাইপস্ক্রিপ্ট নিশ্চিত যে এটা শুধু স্ট্রিং
      },
      include: {
        items: {
          include: { medicine: true }
        },
        customer: { 
          select: { name: true, email: true } 
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'অর্ডারটি খুঁজে পাওয়া যায়নি!' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'অর্ডার ডিটেইলস আনতে সমস্যা হয়েছে!' });
  }
};

// অ্যাডমিনের জন্য সব অর্ডার দেখার এপিআই
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'সব অর্ডার লিস্ট আনতে সমস্যা হয়েছে!' });
  }
};


// ২. অর্ডারের স্ট্যাটাস আপডেট করার এপিআই (Update Order Status)
export const updateOrderStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body; // স্ট্যাটাস আসবে বডি থেকে (যেমন: PROCESSING, DELIVERED, CANCELLED)

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: status }, // Enum value অনুযায়ী আপডেট হবে
    });

    res.json({ message: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!' });
  }
};

