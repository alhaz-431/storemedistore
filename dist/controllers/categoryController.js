"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.createCategory = void 0;
// src/controllers/categoryController.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// এখানে Request, Response কিছুই লাগবে না, শুধু name টা নিলেই হবে
const createCategory = async (name) => {
    // Prisma দিয়ে ডাটাবেসে সেভ করছি
    return await prisma.category.create({
        data: { name }
    });
};
exports.createCategory = createCategory;
// এখানেও Request, Response এর প্রয়োজন নেই
const getAllCategories = async () => {
    return await prisma.category.findMany();
};
exports.getAllCategories = getAllCategories;
