"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (exists)
            return res.status(400).json({ message: "User already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role,
            },
        });
        res.json({ message: "User created", user });
    }
    catch (err) {
        res.status(500).json({ message: "Register failed", err });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: "Wrong password" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            message: "Login success",
            token,
            user,
        });
    }
    catch (err) {
        res.status(500).json({ message: "Login failed", err });
    }
};
exports.login = login;
