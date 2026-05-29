"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs")); // 🎯 ফিক্স: ফাইল সিস্টেম মডিউল ইমপোর্ট করা হলো
const medicine_controller_1 = require("../controllers/medicine.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 🎯 ফিক্স: Render সার্ভারে যদি 'uploads' ফোল্ডার না থাকে, তবে এই কোডটি নিজে থেকেই ফোল্ডার বানিয়ে নেবে
const uploadDir = "uploads/";
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir); // 🎯 ফিক্স: এখানে ডিরেক্ট ভ্যারিয়েবল পাস করা হলো
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// পাবলিক রুটস
router.get("/", medicine_controller_1.getAllMedicines);
router.get("/:id", medicine_controller_1.getMedicineById);
// প্রোটেক্টেড রুটস (সেলার/এডমিনদের জন্য)
router.post("/", authMiddleware_1.authMiddleware, upload.single("image"), medicine_controller_1.createMedicine);
router.patch("/:id", authMiddleware_1.authMiddleware, upload.single("image"), medicine_controller_1.updateMedicine);
router.delete("/:id", authMiddleware_1.authMiddleware, medicine_controller_1.deleteMedicine);
exports.default = router;
