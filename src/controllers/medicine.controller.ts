import { Request, Response } from "express"; // Request যোগ করতে ভুলবেন না
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// ✅ Create Medicine
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const sellerId = req.user?.userId;

    // ইমেজ চেক (Multer ব্যবহার করলে req.file এ পাবেন)
    const imagePath = (req as any).file ? (req as any).file.path : null;

    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন" });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        description: description || "No description",
        price: parseFloat(price),
        stock: parseInt(stock),
        manufacturer: manufacturer || "Unknown",
        categoryId,
        sellerId,
        // আপনার স্কিমাতে নিচের ফিল্ডগুলো থাকলে এগুলো আনকমেন্ট করবেন:
        // image: imagePath, 
        // slug: name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    console.error("❌ Create Error:", error);
    res.status(500).json({ error: "মেডিসিন যোগ করা যায়নি", details: error.message });
  }
};

// ✅ Update Medicine
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const userId = req.user?.userId;

    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMedicine) return res.status(404).json({ error: "পাওয়া যায়নি" });

    // পারমিশন চেক
    if (existingMedicine.sellerId !== userId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "আপনার অনুমতি নেই" });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        manufacturer: manufacturer || undefined,
        categoryId: categoryId || undefined,
      },
      include: { category: true },
    });

    res.json({ success: true, data: updatedMedicine });
  } catch (error: any) {
    res.status(500).json({ error: "আপডেট ব্যর্থ", details: error.message });
  }
};

// ✅ Get All Medicines
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const data = await prisma.medicine.findMany({
      include: { category: true, seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "ডাটা লোড হয়নি" });
  }
};

// ✅ Delete Medicine
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.medicine.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "ডিলিট করা যায়নি" });
  }
};

// ✅ Get By ID
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