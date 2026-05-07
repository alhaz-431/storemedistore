import express, { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicine.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ টাইপসহ স্টোরেজ কনফিগারেশন
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads/");
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ROUTES
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// PROTECTED ROUTES
router.post("/", authMiddleware, upload.single("image"), createMedicine);
router.put("/:id", authMiddleware, upload.single("image"), updateMedicine);
router.delete("/:id", authMiddleware, deleteMedicine);

export default router;