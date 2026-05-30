import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock, manufacturer } = req.body;
    // এখানে কনসোল লগ দিয়ে দেখুন ব্যাকএন্ডে ডাটা আসছে কি না
    console.log("Request Body:", req.body); 
    console.log("User Data:", req.user);

    const sellerId = req.user?.userId;
    if (!sellerId) return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });

    const image = req.file ? (req.file as any).path : null;

    const medicine = await prisma.medicine.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        manufacturer: manufacturer || "Generic",
        image: image,
        categoryId: "cm9n6x4h10000abc123def", // নিশ্চিত করুন এই ID টি ডাটাবেসে আছে
        sellerId: sellerId,
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, manufacturer, categoryId } = req.body;
    const image = req.file ? (req.file as any).path : undefined;
    const updateData: any = { name, description, manufacturer, categoryId, price: parseFloat(price), stock: parseInt(stock), image };
    
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const updatedMedicine = await prisma.medicine.update({ where: { id }, data: updateData });
    res.json({ success: true, data: updatedMedicine });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "আপডেট ব্যর্থ", details: error.message });
  }
};

export const getAllMedicines = async (req: Request, res: Response) => {
  const data = await prisma.medicine.findMany({ include: { category: true } });
  res.json({ success: true, data });
};

export const getMedicineById = async (req: Request, res: Response) => {
  const data = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data });
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  await prisma.medicine.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "ডিলিট সম্পন্ন" });
};