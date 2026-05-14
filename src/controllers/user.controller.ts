import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// আপনার আগের getAllUsers ফাংশন...
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true
    }
  });
};

// আপনার আগের toggleUserBan ফাংশন...
export const toggleUserBan = async (id: string, isBanned: boolean) => {
  return await prisma.user.update({
    where: { id },
    data: { isBanned }
  });
};

// নতুন ফাংশন: ইউজারের ইমেইল দিয়ে ডাটা খুঁজে বের করা (প্রোফাইলের জন্য)
export const getSingleUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email }, // ইমেইল দিয়ে সার্চ করা হচ্ছে
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
      // পাসওয়ার্ড বাদ দিয়েছি সিকিউরিটির জন্য
    }
  });
};