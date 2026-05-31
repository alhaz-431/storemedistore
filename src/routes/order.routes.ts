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



// ১. নতুন অর্ডার তৈরি করা (কাস্টমার)
router.post("/", authMiddleware, createOrder);

// ২. সব অর্ডার লিস্ট (কাস্টমার, সেলার এবং অ্যাডমিন - এখানে রোলের ওপর ভিত্তি করে ফিল্টারিং হবে)
router.get("/", authMiddleware, getAllOrders);

// ৩. ব্যাকওয়ার্ড কম্প্যাটিবিলিটি (যদি পুরনো কোনো পেজে এটি কল করা থাকে)
router.get("/my", authMiddleware, getUserOrders);

// ৪. নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখা
router.get("/:id", authMiddleware, getSingleOrder);

// ৫. কাস্টমার কর্তৃক অর্ডার ক্যানসেল করা
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// ৬. সেলার বা অ্যাডমিন কর্তৃক অর্ডারের স্ট্যাটাস আপডেট করা
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;