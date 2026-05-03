"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// GET ALL USERS
router.get("/", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const users = await (0, user_controller_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});
// BAN / UNBAN USER
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
