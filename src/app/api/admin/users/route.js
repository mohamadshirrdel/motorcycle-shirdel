import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Order } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

// فهرست کاربران سایت + تعداد سفارش هرکدام
export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  await connectDB();
  const filter = {};
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { username: rx }];
  }

  const [users, orders] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
    Order.find({}).select('user customer.phone customer.email').lean(),
  ]);

  const countFor = (u) =>
    orders.filter(
      (o) =>
        String(o.user || '') === String(u._id) ||
        (u.phone && o.customer?.phone === u.phone) ||
        (u.email && o.customer?.email === u.email)
    ).length;

  return NextResponse.json(
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      username: u.username || '',
      phone: u.phone || '',
      email: u.email || '',
      role: u.role || 'user',
      banned: Boolean(u.banned),
      ordersCount: countFor(u),
      createdAt: u.createdAt,
    }))
  );
}
