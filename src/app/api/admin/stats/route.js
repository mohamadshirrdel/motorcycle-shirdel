import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product, Order, Comment, Ticket } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  await connectDB();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    productsCount,
    outOfStock,
    ordersCount,
    pendingOrders,
    revenueAgg,
    pendingComments,
    approvedComments,
    openTickets,
    recentOrders,
    lowStock,
    last7,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['pending', 'paid', 'processing'] } }),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, sum: { $sum: '$total' } } },
    ]),
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'approved' }),
    Ticket.countDocuments({ status: { $in: ['open'] } }),
    Order.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    Product.find({ stock: { $lte: 2 } }).sort({ stock: 1 }).limit(5).select('title stock slug').lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // سری ۷ روز اخیر (روزهای خالی را هم پر کن)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = last7.find((x) => x._id === key);
    days.push({
      date: key,
      label: d.toLocaleDateString('fa-IR', { weekday: 'short' }),
      count: found?.count || 0,
      total: found?.total || 0,
    });
  }

  return NextResponse.json({
    productsCount,
    outOfStock,
    ordersCount,
    pendingOrders,
    revenue: revenueAgg[0]?.sum || 0,
    pendingComments,
    approvedComments,
    openTickets,
    recentOrders: recentOrders.map((o) => ({
      id: String(o._id),
      code: o.code,
      customer: o.customer?.name,
      phone: o.customer?.phone,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
    lowStock: lowStock.map((p) => ({ id: String(p._id), title: p.title, slug: p.slug, stock: p.stock })),
    days,
  });
}
