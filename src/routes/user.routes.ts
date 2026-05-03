import express from "express";
import { getAllUsers, toggleUserBan } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// GET ALL USERS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// BAN / UNBAN USER
router.patch("/:id/ban", authMiddleware, async (req, res) => {
  try {
    const updated = await toggleUserBan(req.params.id, req.body.isBanned);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

export default router;