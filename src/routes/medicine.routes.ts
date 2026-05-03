import express from "express";
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicine.controller";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// PROTECTED ROUTES (LOGIN REQUIRED)
router.post("/", authMiddleware, createMedicine);
router.put("/:id", authMiddleware, updateMedicine);
router.delete("/:id", authMiddleware, deleteMedicine);

export default router;