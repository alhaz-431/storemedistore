"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        // Authorization header থেকে token নাও
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        // Token verify করো
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "medistore_secret_key_2024");
        // Request এ user info add করো
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            email: decoded.email || "",
        };
        next();
    }
    catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
// Role check middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Access denied" });
        }
        next();
    };
};
exports.checkRole = checkRole;
