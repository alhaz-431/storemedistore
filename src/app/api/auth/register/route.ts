import { NextResponse } from 'next/server';
import { registerUser } from '@/controllers/authController';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await registerUser(body);
    
    // রেজিস্টার সফল হলে 201 স্ট্যাটাস কোড
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    // কন্ট্রোলার থেকে আসা এরর মেসেজ (যেমন: "User already exists!") ক্লায়েন্টকে পাঠানো
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}