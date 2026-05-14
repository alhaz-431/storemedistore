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
// CUSTOMER - own orders (নিজের সব অর্ডার দেখা)
router.get("/my", authMiddleware_1.authMiddleware, orderController_1.getMyOrders);
// ✅ ২. CUSTOMER/ADMIN - নির্দিষ্ট একটি অর্ডার দেখা (এটি অবশ্যই getAllOrders এর উপরে থাকবে)
router.get("/:id", authMiddleware_1.authMiddleware, orderController_1.getSingleOrder);
// ADMIN - all orders (সব অর্ডার দেখা)
router.get("/", authMiddleware_1.authMiddleware, orderController_1.getAllOrders);
router.patch('/:id/status', authMiddleware_1.authMiddleware, orderController_1.updateOrderStatus);
exports.default = router;
