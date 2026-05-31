import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ১. নতুন মেডিসিন তৈরি
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock, manufacturer, categoryId } = req.body;
    
    const sellerId = req.user?.userId;
    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });

    // ক্যাটাগরি ভ্যালিডেশন
    let catId = categoryId;
    if (!catId) {
      const firstCategory = await prisma.category.findFirst();
      if (!firstCategory) return res.status(400).json({ error: "ডাটাবেসে কোনো ক্যাটাগরি নেই" });
      catId = firstCategory.id;
    } else {
      const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
      if (!categoryExists) return res.status(400).json({ error: "সঠিক ক্যাটাগরি আইডি দিন" });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        manufacturer: manufacturer || "Generic",
        image: req.file ? req.file.path : null,
        categoryId: catId, 
        sellerId: sellerId,
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    console.error("Create Medicine Error:", error);
    res.status(500).json({ error: "সার্ভার এরর: মেডিসিন তৈরি করা যায়নি" });
  }
};

// ২. মেডিসিন আপডেট করা
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    
    // ক্যাটাগরি আইডি যদি আপডেট করতে চায়, তবে তা ভ্যালিড কি না চেক করুন
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) return res.status(400).json({ error: "ইনভ্যালিড ক্যাটাগরি আইডি" });
    }

    const updateData: any = { 
      name, 
      description, 
      manufacturer, 
      categoryId, 
      price: price !== undefined ? parseFloat(price) : undefined, 
      stock: stock !== undefined ? parseInt(stock) : undefined, 
    };

    if (req.file) {
      updateData.image = req.file.path;
    }
    
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const updatedMedicine = await prisma.medicine.update({ where: { id }, data: updateData });
    res.json({ success: true, data: updatedMedicine });
  } catch (error: any) {
    console.error("Update Medicine Error:", error);
    res.status(500).json({ success: false, error: "আপডেট ব্যর্থ", details: error.message });
  }
};

// ৩. সকল মেডিসিন দেখা
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findMany({ include: { category: true } });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: "ডাটা লোড ব্যর্থ" });
  }
};

// ৪. নির্দিষ্ট মেডিসিন দেখা
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    if (!data) return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: "সার্ভার এরর" });
  }
};

// ৫. ডিলিট করা
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "ডিলিট সম্পন্ন" });
  } catch (error: any) {
    res.status(500).json({ error: "ডিলিট করা সম্ভব হয়নি" });
  }
};