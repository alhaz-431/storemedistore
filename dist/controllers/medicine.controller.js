"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicine = exports.updateMedicine = exports.getMedicineById = exports.getAllMedicines = exports.createMedicine = void 0;
const prisma_1 = require("../lib/prisma");
// CREATE
const createMedicine = async (req, res) => {
    const sellerId = req.user?.userId;
    const medicine = await prisma_1.prisma.medicine.create({
        data: {
            ...req.body,
            sellerId,
        },
    });
    res.json(medicine);
};
exports.createMedicine = createMedicine;
// GET ALL
const getAllMedicines = async (req, res) => {
    const data = await prisma_1.prisma.medicine.findMany();
    res.json(data);
};
exports.getAllMedicines = getAllMedicines;
// GET BY ID
const getMedicineById = async (req, res) => {
    const { id } = req.params;
    const data = await prisma_1.prisma.medicine.findUnique({
        where: { id },
    });
    res.json(data);
};
exports.getMedicineById = getMedicineById;
// UPDATE
const updateMedicine = async (req, res) => {
    const { id } = req.params;
    const updated = await prisma_1.prisma.medicine.update({
        where: { id },
        data: req.body,
    });
    res.json(updated);
};
exports.updateMedicine = updateMedicine;
// DELETE
const deleteMedicine = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.medicine.delete({
        where: { id },
    });
    res.json({ message: "Deleted" });
};
exports.deleteMedicine = deleteMedicine;
