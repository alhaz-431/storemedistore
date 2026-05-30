"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cloudinaryConfig_1 = require("../cloudinaryConfig"); // আপনার কনফিগ ফাইল
const medicine_controller_1 = require("../controllers/medicine.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// পাবলিক রুটস (সবার জন্য)
router.get("/", medicine_controller_1.getAllMedicines);
router.get("/:id", medicine_controller_1.getMedicineById);
// প্রোটেক্টেড রুটস (সেলার/এডমিনদের জন্য)
// ইমেজ আপলোডের জন্য সরাসরি cloudinary মিডলওয়্যার ব্যবহার করা হয়েছে
router.post("/", authMiddleware_1.authMiddleware, cloudinaryConfig_1.upload.single("image"), medicine_controller_1.createMedicine);
router.patch("/:id", authMiddleware_1.authMiddleware, cloudinaryConfig_1.upload.single("image"), medicine_controller_1.updateMedicine);
router.delete("/:id", authMiddleware_1.authMiddleware, medicine_controller_1.deleteMedicine);
exports.default = router;
