import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/userAuth';

// سفارش‌های حساب کاربر (تطبیق با موبایل یا ایمیل حساب)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await connectDB();
  const or = [{ user: user._id }];
  if (user.phone) or.push({ 'customer.phone': user.phone });
  if (user.email) or.push({ 'customer.email': user.email });

  const orders = await Order.find({ $or: or }).sort({ createdAt: -1 }).limit(50).lean();

  return NextResponse.json(
    orders.map((o) => ({
      id: String(o._id),
      code: o.code,
      status: o.status,
      total: o.total,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      items: o.items,
    }))
  );
}
