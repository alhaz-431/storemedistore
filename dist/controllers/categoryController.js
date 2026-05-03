"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.createCategory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// CREATE CATEGORY
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name required" });
        }
        const category = await prisma.category.create({
            data: { name },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create category", error });
    }
};
exports.createCategory = createCategory;
// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};
exports.getAllCategories = getAllCategories;
