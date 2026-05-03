"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicine_controller_1 = require("../controllers/medicine.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// PUBLIC ROUTES
router.get("/", medicine_controller_1.getAllMedicines);
router.get("/:id", medicine_controller_1.getMedicineById);
// PROTECTED ROUTES (LOGIN REQUIRED)
router.post("/", authMiddleware_1.authMiddleware, medicine_controller_1.createMedicine);
router.put("/:id", authMiddleware_1.authMiddleware, medicine_controller_1.updateMedicine);
router.delete("/:id", authMiddleware_1.authMiddleware, medicine_controller_1.deleteMedicine);
exports.default = router;
