import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// সব ইউজারের লিস্ট দেখা (অ্যাডমিনের জন্য)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'ইউজার লিস্ট আনতে সমস্যা হয়েছে!' });
  }
};

// ইউজারকে ব্যান বা আনব্যান করা
export const toggleUserBan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBanned } = req.body; // ফ্রন্টএন্ড থেকে true/false আসবে

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { isBanned: isBanned }
    });

    const status = isBanned ? "ব্যান" : "আনব্যান";
    res.json({ message: `ইউজারকে সফলভাবে ${status} করা হয়েছে!`, data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'ইউজার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!' });
  }
};