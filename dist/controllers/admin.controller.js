"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUsers = void 0;
const prisma_1 = require("../lib/prisma");
const getUsers = async (req, res) => {
    const users = await prisma_1.prisma.user.findMany();
    res.json(users);
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { isBanned } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { isBanned },
    });
    res.json(user);
};
exports.updateUser = updateUser;
