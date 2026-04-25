// src/routes/medicineRoutes.ts
import { Router } from 'express';
import { 
  createMedicine, 
  getAllMedicines, 
  updateMedicine, // নতুন যোগ করা হয়েছে
  deleteMedicine  // নতুন যোগ করা হয়েছে
} from '../controllers/medicineController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ১. সব মেডিসিন দেখা (সবার জন্য উন্মুক্ত)
router.get('/', getAllMedicines);

// ২. নতুন মেডিসিন অ্যাড করা (শুধুমাত্র লগইন করা ইউজার/অ্যাডমিনের জন্য)
router.post('/add', authMiddleware, createMedicine); 

// ৩. মেডিসিন আপডেট করা
router.patch('/:id', updateMedicine);

// ৪. মেডিসিন ডিলিট করা
router.delete('/:id', deleteMedicine);

export default router;