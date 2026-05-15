import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ Create Medicine (ইমেজসহ আপডেট করা হয়েছে)
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const sellerId = req.user?.userId;

    // ১. ইমেজ চেক (Multer ব্যবহার করলে এটি req.file এ আসবে)
    const image = req.file ? req.file.path : null; 

    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });
    
    // ২. ফিল্ড ভ্যালিডেশন
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "প্রয়োজনীয় ফিল্ডগুলো (নাম, দাম, স্টক, ক্যাটাগরি) পূরণ করুন" });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), 
        description: description || "No description",
        price: parseFloat(price),
        stock: parseInt(stock),
        manufacturer: manufacturer || "Unknown",
        image: image, // ডাটাবেজে ইমেজ পাথ সেভ হবে
        categoryId,
        sellerId,
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    console.error("❌ Create Error:", error);
    res.status(500).json({ error: "মেডিসিন যোগ করা যায়নি", details: error.message });
  }
};

// ✅ Update Medicine (এটি controllers/medicine.controller.ts এ পেস্ট করো)
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const userId = req.user?.userId;

    // ১. মেডিসিন আছে কি না চেক
    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMedicine) {
      return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
    }

    // ২. পারমিশন চেক (ID গুলোকে String এ কনভার্ট করে চেক করা নিরাপদ)
    const isOwner = String(existingMedicine.sellerId) === String(userId);
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "আপনার এই মেডিসিনটি এডিট করার অনুমতি নেই" });
    }

    // ৩. নতুন ইমেজ আপলোড হলে সেটি নিবে, নাহলে আগেরটিই থাকবে
    const image = req.file ? req.file.path : existingMedicine.image;

    // ৪. ডাটা আপডেট
    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price.toString()) : undefined,
        stock: stock ? parseInt(stock.toString()) : undefined,
        manufacturer: manufacturer || undefined,
        categoryId: categoryId || undefined,
        image: image, 
      },
      include: { category: true },
    });

    res.json({ success: true, message: "আপডেট সফল হয়েছে", data: updatedMedicine });
  } catch (error: any) {
    console.error("❌ Update Error Details:", error);
    res.status(500).json({ 
      error: "আপডেট ব্যর্থ", 
      details: error.message 
    });
  }
};
// ✅ বাকি ফাংশনগুলো (getAll, delete, getById) আগের মতোই থাকবে...
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findMany({
      include: { category: true, seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "ডাটা লোড হয়নি" });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.medicine.delete({ where: { id } });
    res.json({ message: "সফলভাবে ডিলিট করা হয়েছে" });
  } catch (err) {
    res.status(500).json({ error: "ডিলিট করা যায়নি" });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "সার্ভার এরর" });
  }
};