import express from "express";
import { login, register, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware"; // মিডলওয়্যারটি অবশ্যই ইমপোর্ট করতে হবে

const router = express.Router();

// ১. রেজিস্টার রাউট
router.post("/register", register);

// ২. লগইন রাউট
router.post("/login", login);

// ৩. প্রোফাইল/ইউজার ডাটা রাউট (এটিই আপনার প্রোফাইল লোড এরর ফিক্স করবে)
router.get("/me", authMiddleware, getMe);

export default router;