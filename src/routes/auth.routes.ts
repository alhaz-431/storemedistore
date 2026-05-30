import express from "express";
import { 
  login, 
  register, 
  getMe, 
  updateProfile 
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// ১. রেজিস্টার রাউট (Public)
router.post("/register", register);

// ২. লগইন রাউট (Public)
router.post("/login", login);

// ৩. প্রোফাইল ডাটা লোড (Protected)
router.get("/me", authMiddleware, getMe);

// ৪. প্রোফাইল আপডেট (Protected - এটিই আপনার ৪টি ৪ (404) এরর ফিক্স করবে)
router.patch("/profile", authMiddleware, updateProfile);

export default router;