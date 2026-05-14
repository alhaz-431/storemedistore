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


router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);


router.post("/", authMiddleware, upload.single("image"), createMedicine);


router.patch("/:id", authMiddleware, upload.single("image"), updateMedicine);

router.delete("/:id", authMiddleware, deleteMedicine);

export default router;