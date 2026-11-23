import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order, Product } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

const ALLOWED = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(request, { params }) {
  try {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { status } = await request.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'وضعیت نامعتبر است.' }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'شناسهٔ سفارش نامعتبر است.' }, { status: 400 });
  }

  await connectDB();
  let existing;
  try {
    existing = await Order.findById(id).lean();
  } catch {
    return NextResponse.json({ error: 'شناسهٔ سفارش نامعتبر است.' }, { status: 400 });
  }
  if (!existing) return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 });

  const items = Array.isArray(existing.items) ? existing.items : [];

  // ورود به «لغو شده» → موجودی‌ها برگردانده می‌شود
  if (status === 'cancelled' && existing.status !== 'cancelled') {
    await Promise.all(
      items.filter((i) => i.productId).map((i) =>
        Product.updateOne({ _id: i.productId }, { $inc: { stock: i.qty || 0, sold: -(i.qty || 0) } })
      )
    );
  }
  // خروج از «لغو شده» → موجودی‌ها دوباره کسر می‌شود (در صورت کافی بودن)
  else if (existing.status === 'cancelled' && status !== 'cancelled') {
    const taken = [];
    for (const i of items) {
      if (!i.productId) continue;
      const r = await Product.updateOne(
        { _id: i.productId, stock: { $gte: i.qty || 0 } },
        { $inc: { stock: -(i.qty || 0), sold: i.qty || 0 } }
      );
      if (r.modifiedCount !== 1) {
        await Promise.all(
          taken.map((t) =>
            Product.updateOne({ _id: t.productId }, { $inc: { stock: t.qty, sold: -t.qty } })
          )
        );
        return NextResponse.json(
          { error: `موجودی «${i.title || ''}» برای بازگرداندن این سفارش کافی نیست.` },
          { status: 409 }
        );
      }
      taken.push(i);
    }
  }

  const order = await Order.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).lean();
  return NextResponse.json({ ok: true, status: order.status });
  } catch (e) {
    console.error('PATCH /api/admin/orders/[id]:', e);
    return NextResponse.json({ error: 'خطای سرور در تغییر وضعیت سفارش.' }, { status: 500 });
  }
}
