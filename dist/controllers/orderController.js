"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.createOrder = void 0;
const prisma_1 = require("../lib/prisma");
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const order = await prisma_1.prisma.order.create({
        data: { userId },
    });
    res.json(order);
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    const userId = req.user.id;
    const orders = await prisma_1.prisma.order.findMany({
        where: { userId },
    });
    res.json(orders);
};
exports.getOrders = getOrders;
