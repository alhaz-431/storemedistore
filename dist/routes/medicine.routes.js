"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const medicine_controller_1 = require("../controllers/medicine.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
router.get("/", medicine_controller_1.getAllMedicines);
router.get("/:id", medicine_controller_1.getMedicineById);
router.post("/", authMiddleware_1.authMiddleware, upload.single("image"), medicine_controller_1.createMedicine);
router.patch("/:id", authMiddleware_1.authMiddleware, upload.single("image"), medicine_controller_1.updateMedicine);
router.delete("/:id", authMiddleware_1.authMiddleware, medicine_controller_1.deleteMedicine);
exports.default = router;
