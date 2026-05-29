"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // ১. Authorization হেডার সংগ্রহ করা
    const authHeader = req.headers.authorization;
    // ২. লগিং (ডিব্যাগিংয়ের জন্য)
    console.log("--- Auth Check Start ---");
    console.log("Received Auth Header:", authHeader);
    // ৩. হেডার যাচাই করা
    if (!authHeader) {
        console.log("Error: No Authorization header.");
        return res.status(401).json({ message: "No token provided, please login again." });
    }
    if (!authHeader.startsWith("Bearer ")) {
        console.log("Error: Header is not a Bearer token.");
        return res.status(401).json({ message: "Invalid token format." });
    }
    // ৪. টোকেন আলাদা করা
    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET || "medistore_2026_super_secure_key_9x";
    // ৫. টোকেন ভেরিফাই করা
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("Token Verified Successfully for User:", decoded.id);
        // 🎯 ৬. ইউজার অবজেক্ট সেট করা (id এবং userId দুইটাই দিয়ে দিলাম যাতে কোনো কন্ট্রোলার না আটকে)
        req.user = {
            id: decoded.id || decoded.userId,
            userId: decoded.id || decoded.userId,
            role: decoded.role,
            email: decoded.email || "",
        };
        next(); // সবকিছু ঠিক থাকলে নেক্সট রাউটে যাবে
    }
    catch (error) {
        console.error("JWT Verification Failed:", error.message);
        // টোকেন এক্সপায়ার হলে বিশেষ মেসেজ
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please login again." });
        }
        return res.status(401).json({ message: "Invalid or tampered token." });
    }
};
exports.authMiddleware = authMiddleware;
// রোল চেকিং মিডেলওয়্যার
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
exports.checkRole = checkRole;
