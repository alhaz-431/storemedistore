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
  const orders = await prisma.order.findMany({
    include: { items: true },
  });

  res.json(orders);
};