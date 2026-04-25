import express from 'express';
import { getAllUsers, toggleUserBan } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.patch('/:id/ban', toggleUserBan);

export default router;