import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
  try {
    // 📡 Authorization header থেকে token নেওয়া হচ্ছে
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, please login again." });
    }

    const token = authHeader.split(" ")[1];

    // 🔑 ফিক্স: আপনার .env ফাইলের নতুন সিক্রেট কি-টি এখানে ডিফাইন করা হলো (Fallback সহ)
    const JWT_SECRET = process.env.JWT_SECRET || "medistore_2026_super_secure_key_9x";

    // Token verify করা হচ্ছে
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // ✅ আপনার করা সঠিক ম্যাপিং: টোকেনে 'id' আছে, তাই decoded.id নেওয়া হলো
    req.user = {
      userId: decoded.id, 
      role: decoded.role,
      email: decoded.email || "",
    };
    
    next();
  } catch (error: any) {
    console.error("Auth Middleware Error:", error.message);
    
    // ফ্রন্টএন্ডের fetcher যাতে এই মেসেজটি প্রপারলি রিড করতে পারে
    return res.status(401).json({ 
      message: "আপনার সেশন শেষ বা টোকেনটি অবৈধ! দয়া করে লগআউট করে আবার লগইন করুন।" 
    });
  }
};

// 🛡️ Role check middleware (যেমেন ছিল তেমনই আছে)
export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};