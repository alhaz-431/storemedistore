import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
} from "../controllers/orderController";

const router = express.Router();

// CUSTOMER - create order
router.post("/", authMiddleware, createOrder);

// CUSTOMER - own orders
router.get("/my", authMiddleware, getMyOrders);

// ADMIN - all orders
router.get("/", authMiddleware, getAllOrders);

export default router;