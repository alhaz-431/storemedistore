import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE
export const createMedicine = async (req: AuthRequest, res: Response) => {
  const sellerId = req.user?.userId;

  const medicine = await prisma.medicine.create({
    data: {
      ...req.body,
      sellerId,
    },
  });

  res.json(medicine);
};

// GET ALL
export const getAllMedicines = async (req: Request, res: Response) => {
  const data = await prisma.medicine.findMany();
  res.json(data);
};

// GET BY ID
export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await prisma.medicine.findUnique({
    where: { id },
  });

  res.json(data);
};

// UPDATE
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const updated = await prisma.medicine.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
};

// DELETE
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.medicine.delete({
    where: { id },
  });

  res.json({ message: "Deleted" });
};