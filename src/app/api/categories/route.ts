// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
// যেহেতু কন্ট্রোলার ফাইলটি src/controllers এ আছে, তাই এভাবে ইম্পোর্ট হবে:
import { getAllCategories, createCategory } from '@/controllers/categoryController';

// GET রিকোয়েস্ট (ডাটা দেখার জন্য)
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST রিকোয়েস্ট (ডাটা পাঠানোর জন্য)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body.name পাঠান কারণ কন্ট্রোলারে আপনি name চাচ্ছেন
    const newCategory = await createCategory(body.name); 
    return NextResponse.json({ message: 'Category created', category: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}