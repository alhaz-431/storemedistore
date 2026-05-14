"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// ১. ইউজারের নিজস্ব প্রোফাইল ডাটা পাওয়া
// এটি authMiddleware থেকে ইউজারের ইমেইল নিয়ে ডাটাবেস চেক করবে
router.get("/profile", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        // authMiddleware সাধারণত ডিকোড করা টোকেন থেকে ইমেইলটি req.user এ পাঠিয়ে দেয়
        const email = req.user.email;
        const user = await (0, user_controller_1.getSingleUserByEmail)(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});
// ২. সব ইউজারের লিস্ট (আপনার আগের কোড)
router.get("/", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const users = await (0, user_controller_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});
// ৩. ইউজার ব্যান/আনব্যান করা (আপনার আগের কোড)
router.patch("/:id/ban", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const updated = await (0, user_controller_1.toggleUserBan)(req.params.id, req.body.isBanned);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
});
exports.default = router;
