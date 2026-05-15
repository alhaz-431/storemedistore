import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ ১. মেডিসিন তৈরি করা (Create Medicine)
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });
    
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "প্রয়োজনীয় ফিল্ডগুলো (নাম, দাম, স্টক, ক্যাটাগরি) পূরণ করুন" });
    }

    // ইমেজ চেক (Multer থেকে আসলে path নিবে)
    const image = req.file ? req.file.path : null; 

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`, 
        description: description || "No description",
        price: parseFloat(price.toString()),
        stock: parseInt(stock.toString()),
        manufacturer: manufacturer || "Unknown",
        image: image,
        categoryId,
        sellerId,
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, message: "মেডিসিন সফলভাবে যোগ করা হয়েছে", data: medicine });
  } catch (error: any) {
    console.error("❌ Create Error:", error);
    res.status(500).json({ error: "মেডিসিন যোগ করা যায়নি", details: error.message });
  }
};

// ✅ ২. মেডিসিন আপডেট করা (Update Medicine - Fixed)
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const userId = req.user?.userId;

    // মেডিসিনটি আছে কি না চেক
    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMedicine) return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });

    // পারমিশন চেক (মালিক বা এডমিন কি না)
    const isOwner = String(existingMedicine.sellerId) === String(userId);
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "আপনার এই মেডিসিনটি এডিট করার অনুমতি নেই" });
    }

    // ইমেজ চেক
    const image = req.file ? req.file.path : existingMedicine.image;

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: name ? `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}` : undefined,
        description: description || undefined,
        price: price ? parseFloat(price.toString()) : undefined,
        stock: stock ? parseInt(stock.toString()) : undefined,
        manufacturer: manufacturer || undefined,
        categoryId: categoryId || undefined,
        image: image, 
      },
      include: { category: true },
    });

    res.json({ success: true, message: "আপডেট সফল হয়েছে", data: updatedMedicine });
  } catch (error: any) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: "আপডেট ব্যর্থ", details: error.message });
  }
};

// ✅ ৩. সব মেডিসিন দেখা (Get All Medicines)
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

// ✅ ৪. একটি নির্দিষ্ট মেডিসিন দেখা (Get Single Medicine)
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: { category: true, seller: { select: { name: true, email: true } } }
    });
    if (!data) return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "সার্ভার এরর" });
  }
};

// ✅ ৫. মেডিসিন ডিলিট করা (Delete Medicine)
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });

    // ডিলিট করার আগে পারমিশন চেক
    if (String(medicine.sellerId) !== String(userId) && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "আপনার এটি ডিলিট করার অনুমতি নেই" });
    }

    await prisma.medicine.delete({ where: { id } });
    res.json({ success: true, message: "সফলভাবে ডিলিট করা হয়েছে" });
  } catch (err) {
    res.status(500).json({ error: "ডিলিট করা যায়নি" });
  }
};