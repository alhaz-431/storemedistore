"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const order_controller_1 = require("./../controllers/order.controller");
const router = express_1.default.Router();
// ১. নতুন অর্ডার তৈরি করা
router.post("/", authMiddleware_1.authMiddleware, order_controller_1.createOrder);
// ২. সব অর্ডার গেট করা (কাস্টমার, সেলার এবং অ্যাডমিনের রোল ফিল্টারিং এটার ভেতরেই হবে)
router.get("/", authMiddleware_1.authMiddleware, order_controller_1.getAllOrders);
// ৩. ব্যাকওয়ার্ড কম্প্যাটিবিলিটি রাউট (যদি ফ্রন্টএন্ডের কোথাও কল করা থাকে)
router.get("/my", authMiddleware_1.authMiddleware, order_controller_1.getUserOrders);
// ৪. নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখা (VIEW DETAILS)
router.get("/:id", authMiddleware_1.authMiddleware, order_controller_1.getSingleOrder);
// 🎯 ৫. কাস্টমার কর্তৃক অর্ডার ক্যানসেল করা (CANCEL ORDER)
// ফ্রন্টএন্ডের রিকোয়েস্ট ইউআরএল-এর সাথে মিলিয়ে এটিকে /:id/cancel করা হলো
router.patch("/:id/cancel", authMiddleware_1.authMiddleware, order_controller_1.cancelOrder);
// ৬. অ্যাডমিন কর্তৃক অর্ডারের স্ট্যাটাস আপডেট করা
router.patch("/:id/status", authMiddleware_1.authMiddleware, order_controller_1.updateOrderStatus);
exports.default = router;
