import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// সব ইউজারের লিস্ট (কোনো প্যারামিটার লাগবে না)
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

// ইউজারকে ব্যান/আনব্যান করা (এখানে সরাসরি id এবং status পাঠাবো)
export const toggleUserBan = async (id: string, isBanned: boolean) => {
  return await prisma.user.update({
    where: { id },
    data: { isBanned }
  });
};