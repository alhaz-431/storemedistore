import { NextResponse } from 'next/server';
import { updateMedicine, deleteMedicine } from '@/controllers/medicineController';

// PATCH: নির্দিষ্ট মেডিসিন আপডেট করার জন্য
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updatedData = await updateMedicine(params.id, body);
    
    return NextResponse.json({ 
      message: "মেডিসিন সফলভাবে আপডেট হয়েছে!", 
      data: updatedData 
    });
  } catch (error) {
    return NextResponse.json({ error: 'মেডিসিন আপডেট করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}

// DELETE: নির্দিষ্ট মেডিসিন ডিলিট করার জন্য
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteMedicine(params.id);
    return NextResponse.json({ message: "মেডিসিনটি সফলভাবে ডিলিট করা হয়েছে!" });
  } catch (error) {
    return NextResponse.json({ error: 'মেডিসিন ডিলিট করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}