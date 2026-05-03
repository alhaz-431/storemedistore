import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/categoryController";

const router = express.Router();

/**
 * 🟢 CREATE CATEGORY
 * POST /api/categories
 */
router.post("/", createCategory);

/**
 * 🟢 GET ALL CATEGORIES
 * GET /api/categories
 */
router.get("/", getAllCategories);

export default router;