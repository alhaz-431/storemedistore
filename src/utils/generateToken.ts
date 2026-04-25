// src/utils/generateToken.ts
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'alhaz_secret_key_2026',
    { expiresIn: '7d' }
  );
};