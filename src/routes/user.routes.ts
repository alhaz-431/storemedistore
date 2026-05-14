import express from "express";
import { getAllUsers, toggleUserBan, getSingleUserByEmail } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// ১. ইউজারের নিজস্ব প্রোফাইল ডাটা পাওয়া
// এটি authMiddleware থেকে ইউজারের ইমেইল নিয়ে ডাটাবেস চেক করবে
router.get("/profile", authMiddleware, async (req: any, res) => {
  try {
    // authMiddleware সাধারণত ডিকোড করা টোকেন থেকে ইমেইলটি req.user এ পাঠিয়ে দেয়
    const email = req.user.email; 
    
    const user = await getSingleUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// ২. সব ইউজারের লিস্ট (আপনার আগের কোড)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ৩. ইউজার ব্যান/আনব্যান করা (আপনার আগের কোড)
router.patch("/:id/ban", authMiddleware, async (req, res) => {
  try {
    const updated = await toggleUserBan(req.params.id, req.body.isBanned);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

export default router;