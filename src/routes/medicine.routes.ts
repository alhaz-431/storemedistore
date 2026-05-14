import express from "express";
import multer from "multer";
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

// স্টোরেজ কনফিগারেশন (আপনারটাই ঠিক আছে)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// PUBLIC ROUTES
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// PROTECTED ROUTES
// মেডিসিন অ্যাড করার সময় image ফিল্ড রিসিভ করবে
router.post("/", authMiddleware, upload.single("image"), createMedicine);

// আপডেট করার সময় patch ব্যবহার করা ভালো, এটিও ইমেজ রিসিভ করতে পারবে
router.patch("/:id", authMiddleware, upload.single("image"), updateMedicine);

router.delete("/:id", authMiddleware, deleteMedicine);

export default router;