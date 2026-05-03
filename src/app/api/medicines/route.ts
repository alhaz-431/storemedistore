import { NextResponse } from 'next/server';
import { getAllMedicines, createMedicine } from '@/controllers/medicineController';

// GET: সব মেডিসিন এবং ফিল্টার/প্যাজিনেশন পাওয়ার জন্য
export async function GET(req: Request) {
  try {
    // ইউআরএল থেকে কুয়েরি প্যারামগুলো আলাদা করে নিচ্ছি
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries()); 
    
    const result = await getAllMedicines(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'মেডিসিন লিস্ট আনতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}

// POST: নতুন মেডিসিন যোগ করার জন্য
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // মনে রাখবেন: এখানে আপনার Auth Middleware থেকে ইউজার আইডি নিতে হবে।
    // আপাতত আমি একটি ডামি আইডি দিচ্ছি, আপনি আপনার অথেন্টিকেশন লজিক অনুযায়ী এটি বসাবেন।
    const sellerId = "YOUR_USER_ID_FROM_AUTH"; 
    
    const newMedicine = await createMedicine(body, sellerId);
    return NextResponse.json({ message: 'মেডিসিন সফলভাবে যোগ হয়েছে!', data: newMedicine }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'মেডিসিন যোগ করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}