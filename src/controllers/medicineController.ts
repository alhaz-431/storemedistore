// src/controllers/medicineController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    
    // Middleware থেকে পাওয়া ইউজার আইডি
    const sellerId = (req as any).user?.userId; 

    if (!sellerId) {
      return res.status(401).json({ error: "Unauthorized: Seller ID not found in token" });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        description,
        price: parseFloat(price) || 0, // যদি ডাটা না থাকে তবে ০ ধরবে
        stock: parseInt(stock) || 0,
        manufacturer,
        categoryId,
        sellerId 
      }
    });

    res.status(201).json({ message: 'Medicine added successfully!', medicine });
  } catch (error) {
    console.error(error); // টার্মিনালে এরর দেখার জন্য
    res.status(500).json({ error: 'Failed to add medicine', details: error });
  }
};

// src/controllers/medicineController.ts আপডেট করুন
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const { search, category, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    // সংখ্যায় কনভার্ট করে নিচ্ছি
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const medicines = await prisma.medicine.findMany({
      where: {
        name: search ? { contains: String(search), mode: 'insensitive' } : undefined,
        category: category ? { name: String(category) } : undefined,
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: sortBy ? { [String(sortBy)]: sortOrder === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' },
      
      // প্যাজিনেশন লজিক
      skip: skip,
      take: l,
    });

    // মোট কতগুলো ওষুধ আছে সেটা জানার জন্য
    const total = await prisma.medicine.count({
      where: {
        name: search ? { contains: String(search), mode: 'insensitive' } : undefined,
        category: category ? { name: String(category) } : undefined,
      }
    });

    res.json({
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l)
      },
      data: medicines
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};


// মেডিসিন আপডেট করা
export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body; // এখানে দাম, স্টক বা যেকোনো কিছু থাকতে পারে

  try {
    const updatedMedicine = await prisma.medicine.update({
      where: { id: id as string },
      data: updateData
    });
    res.json({ message: "মেডিসিন সফলভাবে আপডেট হয়েছে!", data: updatedMedicine });
  } catch (error) {
    res.status(500).json({ error: 'মেডিসিন আপডেট করতে সমস্যা হয়েছে!' });
  }
};

// মেডিসিন ডিলিট করা
export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.medicine.delete({
      where: { id: id as string }
    });
    res.json({ message: "মেডিসিনটি সফলভাবে ডিলিট করা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ error: 'মেডিসিন ডিলিট করতে সমস্যা হয়েছে! (হয়তো এই মেডিসিনের কোনো অর্ডার আছে)' });
  }
};