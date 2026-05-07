import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ Create Medicine - Fully Fixed
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId, dosage, expiryDate } = req.body;
    const sellerId = req.user?.userId;

    // ইমেজ চেক (Multer ব্যবহার করলে req.file এ ইমেজ পাবেন)
    // আপনার ফ্রন্টএন্ডে ইমেজ ফিল্ডের নাম 'image'
    const imagePath = (req as any).file ? (req as any).file.path : null;

    if (!sellerId) {
      return res.status(401).json({ error: "টোকেনে সেলার আইডি পাওয়া যায়নি" });
    }

    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "প্রয়োজনীয় তথ্য (Name, Price, Stock, Category) দিন" });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        description: description || "No description provided",
        price: parseFloat(price),
        stock: parseInt(stock),
        image: imagePath, // ইমেজ পাথ ডাটাবেজে সেভ হচ্ছে
        manufacturer: manufacturer || "Unknown Manufacturer",
        categoryId,
        sellerId,
        dosage: dosage || "N/A",
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ 
      success: true, 
      message: "মেডিসিন সফলভাবে যোগ হয়েছে!", 
      data: medicine 
    });
  } catch (error: any) {
    console.error("❌ Create Medicine Error:", error);
    res.status(500).json({ error: "মেডিসিন যোগ করতে ব্যর্থ", details: error.message });
  }
};

// ✅ Update Medicine - Fully Fixed
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId, dosage, expiryDate } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // নতুন ইমেজ থাকলে সেটা নিন, না থাকলে আগেরটাই থাকবে
    const imagePath = (req as any).file ? (req as any).file.path : undefined;

    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });

    if (!existingMedicine) {
      return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
    }

    // পারমিশন চেক
    if (existingMedicine.sellerId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ error: "আপনার এটি আপডেট করার অনুমতি নেই" });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        image: imagePath, // নতুন ইমেজ থাকলে আপডেট হবে
        manufacturer: manufacturer || undefined,
        categoryId: categoryId || undefined,
        dosage: dosage || undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
      include: { 
        category: true,
        seller: { select: { id: true, name: true } }
      },
    });

    res.json({ 
      success: true, 
      message: "সফলভাবে আপডেট হয়েছে!", 
      data: updatedMedicine 
    });
  } catch (error: any) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: "আপডেট ব্যর্থ হয়েছে", details: error.message });
  }
};