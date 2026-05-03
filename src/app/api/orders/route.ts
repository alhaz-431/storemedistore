import { NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/controllers/orderController';

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customerId = "USER_ID_FROM_TOKEN"; // এখানে আপনার Auth আইডি বসাবেন
    const order = await createOrder(body, customerId);
    return NextResponse.json({ message: "অর্ডার সফল!", data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}