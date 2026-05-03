"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicine = exports.updateMedicine = exports.getMedicineById = exports.getMedicines = exports.createMedicine = void 0;
const prisma_1 = require("@/lib/prisma");
// CREATE
const createMedicine = async (req, res) => {
    try {
        const { name, description, price, stock, manufacturer, categoryId } = req.body;
        const medicine = await prisma_1.prisma.medicine.create({
            data: {
                name,
                description,
                price: Number(price),
                stock: Number(stock),
                manufacturer,
                categoryId,
                sellerId: req.user.id,
            },
        });
        res.json(medicine);
    }
    catch (err) {
        res.status(500).json({ message: "Create failed", err });
    }
};
exports.createMedicine = createMedicine;
// GET ALL
const getMedicines = async (_, res) => {
    const medicines = await prisma_1.prisma.medicine.findMany({
        include: { category: true, seller: true },
    });
    res.json(medicines);
};
exports.getMedicines = getMedicines;
// GET SINGLE
const getMedicineById = async (req, res) => {
    const medicine = await prisma_1.prisma.medicine.findUnique({
        where: { id: req.params.id },
    });
    res.json(medicine);
};
exports.getMedicineById = getMedicineById;
// UPDATE
const updateMedicine = async (req, res) => {
    const medicine = await prisma_1.prisma.medicine.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(medicine);
};
exports.updateMedicine = updateMedicine;
// DELETE
const deleteMedicine = async (req, res) => {
    await prisma_1.prisma.medicine.delete({
        where: { id: req.params.id },
    });
    res.json({ message: "Deleted successfully" });
};
exports.deleteMedicine = deleteMedicine;
