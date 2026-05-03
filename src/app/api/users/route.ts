import { NextResponse } from 'next/server';
import { getAllUsers } from '@/controllers/userController';

// সব ইউজার দেখার জন্য GET মেথড
export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'ইউজার লিস্ট আনতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}