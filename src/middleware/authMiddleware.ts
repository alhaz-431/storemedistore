// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // 'Bearer TOKEN_HERE' থেকে শুধু টোকেনটা আলাদা করা
    const tokenOnly = token.split(' ')[1];
    const decoded = jwt.verify(tokenOnly, process.env.JWT_SECRET || 'secret');
    
    // রিকোয়েস্টের সাথে ইউজার ডাটা জুড়ে দেওয়া যাতে কন্ট্রোলার এটা পায়
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};