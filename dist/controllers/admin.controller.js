"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.toggleBanUser = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
// GET ALL USERS
const getAllUsers = async (req, res) => {
    const users = await prisma_1.prisma.user.findMany();
    res.json(users);
};
exports.getAllUsers = getAllUsers;
// BAN / UNBAN USER
const toggleBanUser = async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const updated = await prisma_1.prisma.user.update({
        where: { id },
        data: { isBanned: !user.isBanned },
    });
    res.json(updated);
};
exports.toggleBanUser = toggleBanUser;
// GET ALL ORDERS
const getAllOrders = async (req, res) => {
    const orders = await prisma_1.prisma.order.findMany({
        include: { items: true },
    });
    res.json(orders);
};
exports.getAllOrders = getAllOrders;
