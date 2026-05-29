import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // 🎯 ফিক্স: ফাইল সিস্টেম মডিউল ইমপোর্ট করা হলো
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicine.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// 🎯 ফিক্স: Render সার্ভারে যদি 'uploads' ফোল্ডার না থাকে, তবে এই কোডটি নিজে থেকেই ফোল্ডার বানিয়ে নেবে
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir); // 🎯 ফিক্স: এখানে ডিরেক্ট ভ্যারিয়েবল পাস করা হলো
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// পাবলিক রুটস
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// প্রোটেক্টেড রুটস (সেলার/এডমিনদের জন্য)
router.post("/", authMiddleware, upload.single("image"), createMedicine);
router.patch("/:id", authMiddleware, upload.single("image"), updateMedicine);
router.delete("/:id", authMiddleware, deleteMedicine);

export default router;