"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// 🧑 USERS
router.get("/users", authMiddleware_1.authMiddleware, admin_controller_1.getAllUsers);
router.patch("/users/:id", authMiddleware_1.authMiddleware, admin_controller_1.toggleBanUser);
// 📦 ORDERS
router.get("/orders", authMiddleware_1.authMiddleware, admin_controller_1.getAllOrders);
exports.default = router;
