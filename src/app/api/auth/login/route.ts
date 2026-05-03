import { NextResponse } from 'next/server';
import { loginUser } from '@/controllers/authController';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await loginUser(body);
    
    // লগিন সফল হলে 200 স্ট্যাটাস কোড
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // এরর হলে (যেমন: "Invalid email or password") 401 স্ট্যাটাস কোড
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 });
  }
}