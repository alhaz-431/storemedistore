import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ১. মেডিসিন তৈরি করা (Create)
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) return res.status(401).json({ success: false, error: "সেলার আইডি পাওয়া যায়নি" });
    
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ success: false, error: "প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন" });
    }

    // 🎯 ক্লাউডিনারি থেকে আসা ইমেজ পাথ (URL)
    const image = req.file ? (req.file as any).path : null; 

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`, 
        description: description || "No description",
        price: parseFloat(price.toString()),
        stock: parseInt(stock.toString()),
        manufacturer: manufacturer || "Unknown",
        image: image, // এখানে Cloudinary URL সেভ হবে
        categoryId,
        sellerId,
      },
    });

    res.status(201).json({ success: true, message: "মেডিসিন যোগ হয়েছে", data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "সার্ভার এরর", details: error.message });
  }
};

// ২. মেডিসিন আপডেট করা (Update)
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const userId = req.user?.userId;

    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMedicine) return res.status(404).json({ success: false, error: "মেডিসিন পাওয়া যায়নি" });

    if (String(existingMedicine.sellerId) !== String(userId) && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "অনুমতি নেই" });
    }

    // 🎯 ক্লাউডিনারি থেকে আসা নতুন ইমেজ পাথ অথবা আগের ইমেজ
    const image = req.file ? (req.file as any).path : existingMedicine.image;

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price.toString()) : undefined,
        stock: stock ? parseInt(stock.toString()) : undefined,
        image: image, // নতুন URL আপডেট হবে
        categoryId: categoryId || undefined,
      },
    });

    res.json({ success: true, message: "আপডেট সফল", data: updatedMedicine });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "আপডেট ব্যর্থ", details: error.message });
  }
};

// ৩. সব মেডিসিন দেখা (Get All)
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findMany({
      include: { category: true, seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, error: "ডাটা লোড হয়নি" });
  }
};

// ৪. আইডি দিয়ে মেডিসিন দেখা (Get By Id)
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!data) return res.status(404).json({ success: false, error: "মেডিসিন পাওয়া যায়নি" });
    res.json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, error: "সার্ভার এরর" });
  }
};

// ৫. মেডিসিন ডিলিট করা (Delete)
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) return res.status(404).json({ success: false, error: "মেডিসিন পাওয়া যায়নি" });

    if (String(medicine.sellerId) !== String(userId) && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "অনুমতি নেই" });
    }

    await prisma.medicine.delete({ where: { id } });
    res.json({ success: true, message: "ডিলিট সম্পন্ন" });
  } catch (err) {
    res.status(500).json({ success: false, error: "ডিলিট করা সম্ভব হয়নি" });
  }
};