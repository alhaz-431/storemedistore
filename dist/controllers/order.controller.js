"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.cancelOrder = exports.getSingleOrder = exports.getUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 📦 CREATE ORDER (CUSTOMER)
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingName, shippingPhone, shippingAddress } = req.body;
        const customerId = req.user?.id || req.user?.userId;
        if (!customerId) {
            res.status(401).json({ success: false, message: "লগইন করুন।" });
            return;
        }
        const result = await prisma.$transaction(async (tx) => {
            const orderItemsData = [];
            for (const item of items) {
                const medicine = await tx.medicine.findUnique({
                    where: { id: item.medicineId || item.id },
                    select: { id: true, sellerId: true, stock: true, name: true }
                });
                if (!medicine)
                    throw new Error(`ঔষধটি পাওয়া যায়নি`);
                if (medicine.stock < Number(item.quantity))
                    throw new Error(`${medicine.name} স্টকে নেই`);
                await tx.medicine.update({
                    where: { id: medicine.id },
                    data: { stock: { decrement: Number(item.quantity) } }
                });
                orderItemsData.push({
                    medicineId: medicine.id,
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    sellerId: medicine.sellerId
                });
            }
            return await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}`,
                    totalAmount: Number(totalAmount),
                    shippingName, shippingPhone, shippingAddress,
                    status: "PENDING",
                    customerId: customerId,
                    items: { create: orderItemsData }
                }
            });
        });
        res.status(201).json({ success: true, order: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createOrder = createOrder;
// 👑 GET ALL ORDERS (MULTI-ROLE) - UPDATED WITH CUSTOMER INFO
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const role = req.user?.role?.toUpperCase();
        let queryCondition = {};
        if (role === "CUSTOMER")
            queryCondition = { customerId: userId };
        else if (role === "SELLER")
            queryCondition = { items: { some: { sellerId: userId } } };
        const orders = await prisma.order.findMany({
            where: queryCondition,
            include: {
                items: {
                    include: { medicine: true }
                },
                customer: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
// 👑 GET USER ORDERS (BACKWARD COMPATIBILITY)
const getUserOrders = async (req, res) => {
    return (0, exports.getAllOrders)(req, res);
};
exports.getUserOrders = getUserOrders;
// 🔍 GET SINGLE ORDER
const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { medicine: true } },
                customer: { select: { name: true, email: true } }
            }
        });
        if (!order) {
            res.status(404).json({ message: "অর্ডার পাওয়া যায়নি" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSingleOrder = getSingleOrder;
// ❌ CANCEL ORDER (CUSTOMER)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user?.id || req.user?.userId;
        const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order || order.customerId !== customerId) {
            res.status(403).json({ message: "অনুমতি নেই বা অর্ডার নেই" });
            return;
        }
        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.medicine.update({ where: { id: item.medicineId }, data: { stock: { increment: item.quantity } } });
            }
            await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
        });
        res.status(200).json({ success: true, message: "বাতিল হয়েছে" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.cancelOrder = cancelOrder;
// 👑 UPDATE ORDER STATUS (ADMIN + SELLER)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id || req.user?.userId;
        const role = req.user?.role?.toUpperCase();
        if (role === "SELLER") {
            const isOwner = await prisma.orderItem.findFirst({ where: { orderId: id, sellerId: userId } });
            if (!isOwner) {
                res.status(403).json({ message: "এটি আপনার অর্ডার নয়!" });
                return;
            }
        }
        const updatedOrder = await prisma.order.update({ where: { id }, data: { status } });
        res.status(200).json({ success: true, data: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
