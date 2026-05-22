import express from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // আপনার সঠিক পাথ অনুযায়ী
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus
} from "./../controllers/order.controller"; 

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getUserOrders);
router.patch("/:id", authMiddleware as any, cancelOrder as any);
router.get("/:id", authMiddleware, getSingleOrder);
router.get("/", authMiddleware, getAllOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;