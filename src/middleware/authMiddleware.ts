// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // ১. হেডার থেকে টোকেন নেওয়া
  const authHeader = req.headers.authorization;

  // ২. হেডার না থাকলে এরর দেওয়া
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // ৩. 'Bearer <token>' ফরম্যাট থেকে শুধু টোকেনটা বের করা
    // যদি কেউ Bearer ছাড়া শুধু টোকেন পাঠায়, তাও যেন কাজ করে সে ব্যবস্থা করা হয়েছে
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    if (!token) {
      return res.status(400).json({ error: 'Token format is incorrect.' });
    }

    // ৪. টোকেন ভেরিফাই করা (এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করে)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // ৫. রিকোয়েস্ট অবজেক্টে ইউজার ডাটা সেভ করা যাতে কন্ট্রোলার পায়
    (req as any).user = decoded;
    
    next(); // সবকিছু ঠিক থাকলে পরের ধাপে (Controller) যাবে
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(400).json({ error: 'Invalid token.' });
  }
};