"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicine_controller_1 = require("../controllers/medicine.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/", medicine_controller_1.getMedicines);
router.get("/:id", medicine_controller_1.getMedicineById);
router.post("/", auth_middleware_1.auth, medicine_controller_1.createMedicine);
router.put("/:id", auth_middleware_1.auth, medicine_controller_1.updateMedicine);
router.delete("/:id", auth_middleware_1.auth, medicine_controller_1.deleteMedicine);
exports.default = router;
