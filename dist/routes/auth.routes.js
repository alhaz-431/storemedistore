"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// ১. রেজিস্টার রাউট (Public)
router.post("/register", auth_controller_1.register);
// ২. লগইন রাউট (Public)
router.post("/login", auth_controller_1.login);
// ৩. প্রোফাইল ডাটা লোড (Protected)
router.get("/me", authMiddleware_1.authMiddleware, auth_controller_1.getMe);
// ৪. প্রোফাইল আপডেট (Protected - এটিই আপনার ৪টি ৪ (404) এরর ফিক্স করবে)
router.patch("/profile", authMiddleware_1.authMiddleware, auth_controller_1.updateProfile);
exports.default = router;
