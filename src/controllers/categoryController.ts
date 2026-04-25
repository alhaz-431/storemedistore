// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body; // শুধুমাত্র name নিচ্ছি, কারণ আপনার স্কিমাতে অন্য কিছু নেই
    
    const category = await prisma.category.create({
      data: { name }
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};