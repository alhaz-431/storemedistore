"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleUserByEmail = exports.toggleUserBan = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// আপনার আগের getAllUsers ফাংশন...
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
// আপনার আগের toggleUserBan ফাংশন...
const toggleUserBan = async (id, isBanned) => {
    return await prisma.user.update({
        where: { id },
        data: { isBanned }
    });
};
exports.toggleUserBan = toggleUserBan;
// নতুন ফাংশন: ইউজারের ইমেইল দিয়ে ডাটা খুঁজে বের করা (প্রোফাইলের জন্য)
const getSingleUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }, // ইমেইল দিয়ে সার্চ করা হচ্ছে
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
            // পাসওয়ার্ড বাদ দিয়েছি সিকিউরিটির জন্য
        }
    });
};
exports.getSingleUserByEmail = getSingleUserByEmail;
