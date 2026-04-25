import express from 'express';
import { createOrder } from '../controllers/orderController';

const router = express.Router();

// এখানে আমরা POST রিকোয়েস্ট হ্যান্ডেল করব
router.post('/', createOrder);

export default router;