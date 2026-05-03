"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.getMyOrders = exports.createOrder = void 0;
const prisma_1 = require("../lib/prisma");
// CREATE ORDER
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { items, shippingAddress, shippingName, shippingPhone } = req.body;
        let totalAmount = 0;
        for (const item of items) {
            const medicine = await prisma_1.prisma.medicine.findUnique({
                where: { id: item.medicineId },
            });
            if (!medicine) {
                return res.status(404).json({ message: "Medicine not found" });
            }
            totalAmount += medicine.price * item.quantity;
        }
        const order = await prisma_1.prisma.order.create({
            data: {
                customerId: userId,
                totalAmount,
                shippingAddress,
                shippingName,
                shippingPhone,
                items: {
                    create: items.map((item) => ({
                        medicineId: item.medicineId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: "Order failed", error });
    }
};
exports.createOrder = createOrder;
// GET MY ORDERS (CUSTOMER)
const getMyOrders = async (req, res) => {
    const userId = req.user?.userId;
    const orders = await prisma_1.prisma.order.findMany({
        where: { customerId: userId },
        include: { items: true },
    });
    res.json(orders);
};
exports.getMyOrders = getMyOrders;
// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
    const orders = await prisma_1.prisma.order.findMany({
        include: { items: true },
    });
    res.json(orders);
};
exports.getAllOrders = getAllOrders;
