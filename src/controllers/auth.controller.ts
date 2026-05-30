import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // 👤 বেসিক ফিল্ড ভ্যালিডেশন চেক
    if (!name || !email || !password) {
      return res.status(400).json({ message: "নাম, ইমেইল এবং পাসওয়ার্ড বাধ্যতামূলক।" });
    }

    // 📧 ইমেইল ছোটহাতে কনভার্ট করে ডাটাবেজে খোঁজা (সেফটি চেক)
    const cleanedEmail = email.toLowerCase().trim();
    const exists = await prisma.user.findUnique({ where: { email: cleanedEmail } });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // 🎭 ফ্রন্টএন্ড থেকে রোল ছোটহাতে বা না আসলেও যেন ডাটাবেজের Enum এর সাথে ম্যাচ করে (UPPERCASE)
    const finalRole = role ? role.toUpperCase() : "CUSTOMER";

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanedEmail,
        password: hashed,
        role: finalRole, // 🚀 এবার ডাটাবেজের সাথে পারফেক্টলি ম্যাচ করবে
      },
    });

    res.json({ message: "User created", user });
  } catch (err: any) {
    console.error("❌ REGISTER DATABASE ERROR:", err);
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "ইমেইল এবং পাসওয়ার্ড দিন।" });
    }

    const cleanedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanedEmail } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user,
    });
  } catch (err: any) {
    console.error("❌ LOGIN DATABASE ERROR:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};


export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id; // মিডলওয়্যার থেকে ইউজার আইডি পাওয়া যাচ্ছে
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};