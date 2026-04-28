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

router.get('/', getAllMedicines);


router.post('/add', authMiddleware, createMedicine); 

router.patch('/:id', updateMedicine);


router.delete('/:id', deleteMedicine);

export default router;