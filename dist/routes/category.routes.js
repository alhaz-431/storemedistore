"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
/**
 * 🟢 CREATE CATEGORY
 * POST /api/categories
 */
router.post("/", categoryController_1.createCategory);
/**
 * 🟢 GET ALL CATEGORIES
 * GET /api/categories
 */
router.get("/", categoryController_1.getAllCategories);
exports.default = router;
