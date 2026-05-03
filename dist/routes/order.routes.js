"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// CUSTOMER - create order
router.post("/", authMiddleware_1.authMiddleware, orderController_1.createOrder);
// CUSTOMER - own orders
router.get("/my", authMiddleware_1.authMiddleware, orderController_1.getMyOrders);
// ADMIN - all orders
router.get("/", authMiddleware_1.authMiddleware, orderController_1.getAllOrders);
exports.default = router;
