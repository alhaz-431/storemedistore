"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const order_controller_1 = require("./../controllers/order.controller");
const router = express_1.default.Router();
/**
 * 📦 ORDER ROUTES
 * Middleware 'authMiddleware' ব্যবহার করা হয়েছে সব রাউটে,
 * কারণ অর্ডার দেখার বা করার জন্য ইউজারকে অবশ্যই লগইন থাকতে হবে।
 */
// ১. নতুন অর্ডার তৈরি করা (কাস্টমার)
router.post("/", authMiddleware_1.authMiddleware, order_controller_1.createOrder);
// ২. সব অর্ডার লিস্ট (কাস্টমার, সেলার এবং অ্যাডমিন - এখানে রোলের ওপর ভিত্তি করে ফিল্টারিং হবে)
router.get("/", authMiddleware_1.authMiddleware, order_controller_1.getAllOrders);
// ৩. ব্যাকওয়ার্ড কম্প্যাটিবিলিটি (যদি পুরনো কোনো পেজে এটি কল করা থাকে)
router.get("/my", authMiddleware_1.authMiddleware, order_controller_1.getUserOrders);
// ৪. নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখা
router.get("/:id", authMiddleware_1.authMiddleware, order_controller_1.getSingleOrder);
// ৫. কাস্টমার কর্তৃক অর্ডার ক্যানসেল করা
router.patch("/:id/cancel", authMiddleware_1.authMiddleware, order_controller_1.cancelOrder);
// ৬. সেলার বা অ্যাডমিন কর্তৃক অর্ডারের স্ট্যাটাস আপডেট করা
router.patch("/:id/status", authMiddleware_1.authMiddleware, order_controller_1.updateOrderStatus);
exports.default = router;
