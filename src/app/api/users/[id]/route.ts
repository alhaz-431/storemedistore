import { NextResponse } from 'next/server';
import { toggleUserBan } from '@/controllers/userController';

// ইউজার আপডেট করার জন্য PATCH মেথড
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // বডি থেকে ফ্রন্টএন্ডের পাঠানো true বা false নিচ্ছি
    const { isBanned } = await req.json();
    
    // URL এর [id] থেকে আইডিটা নিচ্ছি
    const id = params.id; 
    
    const updatedUser = await toggleUserBan(id, isBanned);
    
    return NextResponse.json({ 
      message: 'ইউজার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!', 
      data: updatedUser 
    });
  } catch (error) {
    return NextResponse.json({ error: 'আপডেট করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}