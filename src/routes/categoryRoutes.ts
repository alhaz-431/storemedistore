// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/categoryController';

const router = Router();

router.post('/', createCategory); // ক্যাটাগরি তৈরি
router.get('/', getAllCategories); // সব ক্যাটাগরি দেখা

export default router;