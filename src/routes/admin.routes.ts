import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

import {
  getAllUsers,
  toggleBanUser,
  getAllOrders,
} from "../controllers/admin.controller";

const router = express.Router();

// 🧑 USERS
router.get("/users", authMiddleware, getAllUsers);
router.patch("/users/:id", authMiddleware, toggleBanUser);

// 📦 ORDERS
router.get("/orders", authMiddleware, getAllOrders);

export default router;