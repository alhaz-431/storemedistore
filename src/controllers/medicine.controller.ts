import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ১. মেডিসিন তৈরি করা (লগসহ)
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock, manufacturer, categoryId, description } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });

    let catId = categoryId;
    if (!catId) {
      const firstCategory = await prisma.category.findFirst();
      if (!firstCategory) return res.status(400).json({ error: "ডাটাবেসে কোনো ক্যাটাগরি নেই" });
      catId = firstCategory.id;
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        manufacturer: manufacturer || "Generic",
        description: description || null,
        image: req.file ? req.file.path : null,
        categoryId: catId,
        sellerId: sellerId,
      },
    });

    await prisma.activityLog.create({
      data: { action: "ADD_MEDICINE", medicineId: medicine.id, userId: sellerId }
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ error: "মেডিসিন তৈরি করতে ব্যর্থ" });
  }
};

// ২. মেডিসিন আপডেট করা (লগসহ)
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const sellerId = req.user?.userId;

    const updateData: any = {
      name, description, manufacturer, categoryId,
      price: price !== undefined ? parseFloat(price) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
    };

    if (req.file) updateData.image = req.file.path;
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: updateData,
    });

    if (sellerId) {
      await prisma.activityLog.create({
        data: { action: "EDIT_MEDICINE", medicineId: id, userId: sellerId }
      });
    }

    res.json({ success: true, data: updatedMedicine });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "আপডেট ব্যর্থ" });
  }
};

// ৩. এডমিন কন্ট্রোলার (ইউজার লিস্ট ও কাউন্টসহ)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { 
            medicines: true,
            activityLogs: true 
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ৪. সকল মেডিসিন দেখা (পাবলিক)
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findMany({
      include: { category: true, seller: true },
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: "ডাটা লোড করতে ব্যর্থ" });
  }
};

// ৫. আইডি দিয়ে মেডিসিন দেখা
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!data) return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: "সার্ভার এরর" });
  }
};

// ৬. ডিলিট করা
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "ডিলিট সম্পন্ন" });
  } catch (error: any) {
    res.status(500).json({ error: "ডিলিট করা সম্ভব হয়নি" });
  }
};