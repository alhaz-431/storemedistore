"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserBan = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// সব ইউজারের লিস্ট (কোনো প্যারামিটার লাগবে না)
const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isBanned: true,
            createdAt: true
        }
    });
};
exports.getAllUsers = getAllUsers;
// ইউজারকে ব্যান/আনব্যান করা (এখানে সরাসরি id এবং status পাঠাবো)
const toggleUserBan = async (id, isBanned) => {
    return await prisma.user.update({
        where: { id },
        data: { isBanned }
    });
};
exports.toggleUserBan = toggleUserBan;
