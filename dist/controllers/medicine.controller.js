"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicine = exports.getMedicineById = exports.getAllMedicines = exports.updateMedicine = exports.createMedicine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// নতুন এই কোডটি এখানে বসান
const createMedicine = async (req, res) => {
    try {
        const { name, price, stock, manufacturer, categoryId } = req.body;
        const sellerId = req.user?.userId;
        if (!sellerId)
            return res.status(401).json({ error: "সেলার আইডি পাওয়া যায়নি" });
        const catId = categoryId || "cm9n6x4h10000abc123def";
        const medicine = await prisma.medicine.create({
            data: {
                name,
                slug: `${name.toLowerCase().replace(/ /g, "-")}-${Date.now()}`,
                price: Number(price) || 0,
                stock: Number(stock) || 0,
                manufacturer: manufacturer || "Generic",
                image: req.file ? req.file.path : null,
                categoryId: catId,
                sellerId: sellerId,
            },
        });
        res.status(201).json({ success: true, data: medicine });
    }
    catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: error.message || "সার্ভার এরর" });
    }
};
exports.createMedicine = createMedicine;
const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        // ১. এখানে লগগুলো চেক করুন
        console.log("Updating ID:", id);
        console.log("Body Data:", req.body);
        console.log("File Data:", req.file); // ইমেজ ফাইল আসছে কি না সেটিও দেখা যাবে
        const { name, description, price, stock, manufacturer, categoryId } = req.body;
        const updateData = {
            name,
            description,
            manufacturer,
            categoryId,
            price: price !== undefined ? parseFloat(price) : undefined,
            stock: stock !== undefined ? parseInt(stock) : undefined,
        };
        if (req.file) {
            updateData.image = req.file.path;
        }
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        const updatedMedicine = await prisma.medicine.update({ where: { id }, data: updateData });
        res.json({ success: true, data: updatedMedicine });
    }
    catch (error) {
        // ২. সার্ভারে যদি ক্র্যাশ করে, এখানে বিস্তারিত এরর দেখাবে
        console.error("Backend Catch Error details:", error);
        res.status(500).json({ success: false, error: "আপডেট ব্যর্থ", details: error.message });
    }
};
exports.updateMedicine = updateMedicine;
const getAllMedicines = async (req, res) => {
    const data = await prisma.medicine.findMany({ include: { category: true } });
    res.json({ success: true, data });
};
exports.getAllMedicines = getAllMedicines;
const getMedicineById = async (req, res) => {
    const data = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data });
};
exports.getMedicineById = getMedicineById;
const deleteMedicine = async (req, res) => {
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "ডিলিট সম্পন্ন" });
};
exports.deleteMedicine = deleteMedicine;
