import express from "express";
import { authMiddleware } from "../middleware/authMiddleware"; 
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus
} from "./../controllers/order.controller"; 

const router = express.Router();

// ১. নতুন অর্ডার তৈরি করা
router.post("/", authMiddleware, createOrder);

// ২. সব অর্ডার গেট করা (কাস্টমার, সেলার এবং অ্যাডমিনের রোল ফিল্টারিং এটার ভেতরেই হবে)
router.get("/", authMiddleware, getAllOrders);

// ৩. ব্যাকওয়ার্ড কম্প্যাটিবিলিটি রাউট (যদি ফ্রন্টএন্ডের কোথাও কল করা থাকে)
router.get("/my", authMiddleware, getUserOrders);

// ৪. নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখা (VIEW DETAILS)
router.get("/:id", authMiddleware, getSingleOrder);

// 🎯 ৫. কাস্টমার কর্তৃক অর্ডার ক্যানসেল করা (CANCEL ORDER)
// ফ্রন্টএন্ডের রিকোয়েস্ট ইউআরএল-এর সাথে মিলিয়ে এটিকে /:id/cancel করা হলো
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// ৬. অ্যাডমিন কর্তৃক অর্ডারের স্ট্যাটাস আপডেট করা
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;