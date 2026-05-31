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


router.post("/", authMiddleware, upload.single("image"), createMedicine);
router.patch("/:id", authMiddleware, upload.single("image"), updateMedicine);
router.delete("/:id", authMiddleware, deleteMedicine);

export default router;