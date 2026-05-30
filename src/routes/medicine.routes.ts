import express, { Router } from "express";
import { upload } from "../cloudinaryConfig"; // আপনার কনফিগ ফাইল
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicine.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// পাবলিক রুটস (সবার জন্য)
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// প্রোটেক্টেড রুটস (সেলার/এডমিনদের জন্য)
// ইমেজ আপলোডের জন্য সরাসরি cloudinary মিডলওয়্যার ব্যবহার করা হয়েছে
router.post("/", authMiddleware, upload.single("image"), createMedicine);
router.patch("/:id", authMiddleware, upload.single("image"), updateMedicine);
router.delete("/:id", authMiddleware, deleteMedicine);

export default router;