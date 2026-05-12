import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder, // ✅ ১. নতুন ফাংশনটা ইম্পোর্ট করুন
} from "../controllers/orderController";

const router = express.Router();

// CUSTOMER - create order
router.post("/", authMiddleware, createOrder);

// CUSTOMER - own orders (নিজের সব অর্ডার দেখা)
router.get("/my", authMiddleware, getMyOrders);

// ✅ ২. CUSTOMER/ADMIN - নির্দিষ্ট একটি অর্ডার দেখা (এটি অবশ্যই getAllOrders এর উপরে থাকবে)
router.get("/:id", authMiddleware, getSingleOrder);

// ADMIN - all orders (সব অর্ডার দেখা)
router.get("/", authMiddleware, getAllOrders);

export default router;