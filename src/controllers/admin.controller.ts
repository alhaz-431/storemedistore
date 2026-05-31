import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

// BAN / UNBAN USER
export const toggleBanUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isBanned: !user.isBanned },
  });

  res.json(updated);
};

// GET ALL ORDERS
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true } }, // কাস্টমারের নাম
        items: { 
          include: { medicine: { select: { name: true } } } // মেডিসিনের নামসহ ডিটেইলস
        }
      },
      orderBy: { createdAt: 'desc' } // নতুন অর্ডারগুলো আগে দেখাবে
    });

    res.json(orders);
  } catch (error) {
    console.error("Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};