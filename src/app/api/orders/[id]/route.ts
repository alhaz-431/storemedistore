import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/controllers/orderController';

// GET: নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখার জন্য
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'অর্ডারটি খুঁজে পাওয়া যায়নি!' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'অর্ডার ডিটেইলস আনতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}

// PATCH: অর্ডারের স্ট্যাটাস (যেমন: Pending -> Delivered) আপডেট করার জন্য
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json(); // বডি থেকে নতুন স্ট্যাটাস নিচ্ছি
    const updatedOrder = await updateOrderStatus(params.id, status);
    
    return NextResponse.json({ 
      message: "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!", 
      data: updatedOrder 
    });
  } catch (error) {
    return NextResponse.json({ error: 'অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}