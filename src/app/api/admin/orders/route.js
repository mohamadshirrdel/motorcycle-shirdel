import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const q = (searchParams.get('q') || '').trim();

  await connectDB();
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ code: rx }, { 'customer.name': rx }, { 'customer.phone': rx }];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(
    orders.map((o) => ({ ...o, _id: String(o._id) }))
  );
}
