// src/controllers/categoryController.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// এখানে Request, Response কিছুই লাগবে না, শুধু name টা নিলেই হবে
export const createCategory = async (name: string) => {
  // Prisma দিয়ে ডাটাবেসে সেভ করছি
  return await prisma.category.create({
    data: { name }
  });
};

// এখানেও Request, Response এর প্রয়োজন নেই
export const getAllCategories = async () => {
  return await prisma.category.findMany();
};