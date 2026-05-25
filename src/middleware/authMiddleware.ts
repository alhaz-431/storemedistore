import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ইউজারের ডেটা টাইপ ডিফাইন করা
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // ১. Authorization হেডার সংগ্রহ করা
  const authHeader = req.headers.authorization;

  // ২. লগিং (ডিব্যাগিংয়ের জন্য)
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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token Verified Successfully for User:", decoded.id);

    // ৬. ইউজার অবজেক্ট সেট করা
    req.user = {
      userId: decoded.id,
      role: decoded.role,
      email: decoded.email || "",
    };

    next(); // সবকিছু ঠিক থাকলে নেক্সট রাউটে যাবে
  } catch (error: any) {
    console.error("JWT Verification Failed:", error.message);
    
    // টোকেন এক্সপায়ার হলে বিশেষ মেসেজ
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    return res.status(401).json({ message: "Invalid or tampered token." });
  }
};

// রোল চেকিং মিডেলওয়্যার
export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};