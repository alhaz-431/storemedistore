// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateToken } from '../utils/generateToken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    // ১. ইউজার আগে থেকেই আছে কি না চেক
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' }); 
    }

    // ২. পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await hashPassword(password);
    
    // ৩. রোল হ্যান্ডেল করা (ফ্রন্টএন্ড থেকে আসা রোল বড় হাতের করা)
    const userRole = role ? role.toUpperCase() : 'CUSTOMER';

    // ৪. ডাটাবেসে ইউজার তৈরি
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: userRole 
      }
    });

    // ৫. রেজিস্ট্রেশন শেষেই টোকেন তৈরি করা (যাতে ফ্রন্টএন্ডে সেভ হতে পারে)
    const token = generateToken(user.id, user.role);

    // ৬. সাকসেস রেসপন্স
    res.status(201).json({ 
      message: 'User created successfully', 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Registration failed!', details: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // ১. ইমেইল দিয়ে ইউজার খোঁজা
    const user = await prisma.user.findUnique({ where: { email } });

    // ২. ইউজার না থাকলে বা পাসওয়ার্ড না মিললে
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ৩. টোকেন তৈরি করা
    const token = generateToken(user.id, user.role);

    // ৪. সাকসেস রেসপন্স পাঠানো
    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Login failed!' });
  }
};