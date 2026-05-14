"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicineById = exports.deleteMedicine = exports.getAllMedicines = exports.updateMedicine = exports.createMedicine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create Medicine (ইমেজসহ আপডেট করা হয়েছে)
const createMedicine = async (req, res) => {
    try {
        const { name, description, price, stock, manufacturer, categoryId } = req.body;
        const sellerId = req.user?.userId;
        // ১. ইমেজ চেক (Multer ব্যবহার করলে এটি req.file এ আসবে)
        const image = req.file ? req.file.path : null;
        if (!sellerId)
            return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });
        // ২. ফিল্ড ভ্যালিডেশন
        if (!name || !price || !stock || !categoryId) {
            return res.status(400).json({ error: "প্রয়োজনীয় ফিল্ডগুলো (নাম, দাম, স্টক, ক্যাটাগরি) পূরণ করুন" });
        }
        const medicine = await prisma.medicine.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
                description: description || "No description",
                price: parseFloat(price),
                stock: parseInt(stock),
                manufacturer: manufacturer || "Unknown",
                image: image, // ডাটাবেজে ইমেজ পাথ সেভ হবে
                categoryId,
                sellerId,
            },
            include: {
                category: true,
                seller: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({ success: true, data: medicine });
    }
    catch (error) {
        console.error("❌ Create Error:", error);
        res.status(500).json({ error: "মেডিসিন যোগ করা যায়নি", details: error.message });
    }
};
exports.createMedicine = createMedicine;
// ✅ Update Medicine (ইমেজসহ আপডেট করা হয়েছে)
const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, manufacturer, categoryId } = req.body;
        const userId = req.user?.userId;
        const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
        if (!existingMedicine)
            return res.status(404).json({ error: "মেডিসিন পাওয়া যায়নি" });
        // পারমিশন চেক (সেলার নিজে নাকি বা এডমিন কি না)
        if (existingMedicine.sellerId !== userId && req.user?.role !== "ADMIN") {
            return res.status(403).json({ error: "আপনার এই মেডিসিনটি এডিট করার অনুমতি নেই" });
        }
        // নতুন ইমেজ আপলোড হলে সেটি নিবে, নাহলে আগেরটিই থাকবে
        const image = req.file ? req.file.path : existingMedicine.image;
        const updatedMedicine = await prisma.medicine.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description || undefined,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                manufacturer: manufacturer || undefined,
                categoryId: categoryId || undefined,
                image: image, // ইমেজ আপডেট
            },
            include: { category: true },
        });
        res.json({ success: true, data: updatedMedicine });
    }
    catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ error: "আপডেট ব্যর্থ", details: error.message });
    }
};
exports.updateMedicine = updateMedicine;
// ✅ বাকি ফাংশনগুলো (getAll, delete, getById) আগের মতোই থাকবে...
const getAllMedicines = async (req, res) => {
    try {
        const data = await prisma.medicine.findMany({
            include: { category: true, seller: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "ডাটা লোড হয়নি" });
    }
};
exports.getAllMedicines = getAllMedicines;
const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.medicine.delete({ where: { id } });
        res.json({ message: "সফলভাবে ডিলিট করা হয়েছে" });
    }
    catch (err) {
        res.status(500).json({ error: "ডিলিট করা যায়নি" });
    }
};
exports.deleteMedicine = deleteMedicine;
const getMedicineById = async (req, res) => {
    try {
        const data = await prisma.medicine.findUnique({
            where: { id: req.params.id },
            include: { category: true }
        });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "সার্ভার এরর" });
    }
};
exports.getMedicineById = getMedicineById;
