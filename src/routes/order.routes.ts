import express from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // আপনার প্রোজেক্টের পাথ অনুযায়ী ঠিক রাখুন
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController"; 

const router = express.Router();

// 🎯 কাস্টমার - নতুন অর্ডার তৈরি করা
router.post("/", authMiddleware, createOrder);

// 📦 কাস্টমার - নিজের সব অর্ডার লিস্ট দেখা
router.get("/my", authMiddleware, getUserOrders);

// ❌ কাস্টমার - নিজের অর্ডার বাতিল করা
router.patch("/:id", authMiddleware as any, cancelOrder as any);

// 🔍 কাস্টমার/এডমিন - নির্দিষ্ট একটি সিঙ্গেল অর্ডার ডিটেইলস দেখা
router.get("/:id", authMiddleware, getSingleOrder);

// 👑 এডমিন - সব কাস্টমারের অর্ডারের মাস্টার লিস্ট দেখা
router.get("/", authMiddleware, getAllOrders);

// 👑 এডমিন - অর্ডারের স্ট্যাটাস আপডেট করা (যেমন: PENDING থেকে SHIPPED করা)
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;