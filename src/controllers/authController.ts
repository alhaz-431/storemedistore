// src/controllers/authController.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateToken } from '../utils/generateToken';

const prisma = new PrismaClient();

// রেজিষ্ট্রেশনের জন্য নতুন কোড
export const registerUser = async (data: any) => {
  const { name, email, password, role } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists!');
  }

  const hashedPassword = await hashPassword(password);
  const userRole = role ? role.toUpperCase() : 'CUSTOMER';

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: userRole }
  });

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, name: user.name, role: user.role } };
};

// লগইনের জন্য নতুন কোড
export const loginUser = async (data: any) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, name: user.name, role: user.role } };
};