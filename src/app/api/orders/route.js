import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product, Order } from '@/lib/models';
import { getUserSession, normalizePhone } from '@/lib/userAuth';
import { User } from '@/lib/models';

// ثبت سفارش جدید — قیمت‌ها و جمع کل همیشه سمت سرور از دیتابیس خوانده می‌شود
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, paymentMethod, note } = body || {};

    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json({ error: 'نام و شماره موبایل الزامی است.' }, { status: 400 });
    }
    const phone = normalizePhone(customer.phone);
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست.' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است.' }, { status: 400 });
    }

    await connectDB();

    const slugs = items.map((i) => String(i.slug));
    const products = await Product.find({ slug: { $in: slugs } }).lean();
    if (products.length === 0) {
      return NextResponse.json({ error: 'محصولی یافت نشد.' }, { status: 400 });
    }

    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const p = products.find((x) => x.slug === item.slug);
      if (!p) continue;
      const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
      const available = p.stock ?? 0;
      if (qty > available) {
        return NextResponse.json(
          { error: `موجودی «${p.title}» کافی نیست؛ فقط ${available.toLocaleString('fa-IR')} دستگاه باقی مانده است.` },
          { status: 409 }
        );
      }
      const unit = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
      orderItems.push({
        productId: String(p._id),
        slug: p.slug,
        title: p.title,
        image: p.images?.[0] || '',
        price: unit,
        qty,
      });
      total += unit * qty;
    }
    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'هیچ محصول معتبری در سبد یافت نشد.' }, { status: 400 });
    }

    // کسر اتمیک موجودی — اگر در این لحظه بین درخواست و ثبت سبقت رخ دهد، همه‌چیز برمی‌گردد
    const decremented = [];
    for (const i of orderItems) {
      const r = await Product.updateOne(
        { _id: i.productId, stock: { $gte: i.qty } },
        { $inc: { stock: -i.qty, sold: i.qty } }
      );
      if (r.modifiedCount !== 1) {
        await Promise.all(
          decremented.map((d) =>
            Product.updateOne({ _id: d.productId }, { $inc: { stock: d.qty, sold: -d.qty } })
          )
        );
        const fresh = await Product.findById(i.productId).select('title stock').lean().catch(() => null);
        return NextResponse.json(
          { error: `موجودی «${fresh?.title || i.title}» کافی نیست؛ فقط ${(fresh?.stock ?? 0).toLocaleString('fa-IR')} دستگاه باقی مانده است.` },
          { status: 409 }
        );
      }
      decremented.push(i);
    }

    const isOnline = paymentMethod === 'online';
    const session = await getUserSession();
    let accountUserId = null;
    if (session?.sub) {
      const u = await User.findById(session.sub).select('banned').lean().catch(() => null);
      if (u?.banned) {
        return NextResponse.json({ error: 'حساب شما مسدود شده است.' }, { status: 403 });
      }
      accountUserId = session.sub;
    }
    const code = `SD-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0')}`;

    let order;
    try {
      order = await Order.create({
        code,
        user: accountUserId,
        customer: {
          name: String(customer.name).trim().slice(0, 80),
          phone,
          email: String(customer.email || '').trim().slice(0, 80),
          city: String(customer.city || '').trim().slice(0, 60),
          address: String(customer.address || '').trim().slice(0, 300),
        },
        items: orderItems,
        total,
        paymentMethod: isOnline ? 'online' : 'cod',
        status: isOnline ? 'paid' : 'pending', // درگاه آنلاین شبیه‌سازی‌شده: پرداخت موفق
        note: String(note || '').slice(0, 500),
      });
    } catch (createErr) {
      await Promise.all(
        decremented.map((d) =>
          Product.updateOne({ _id: d.productId }, { $inc: { stock: d.qty, sold: -d.qty } })
        )
      );
      throw createErr;
    }

    return NextResponse.json(
      {
        ok: true,
        code: order.code,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        customer: { name: order.customer.name, phone: order.customer.phone },
        items: orderItems,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error('POST /api/orders:', e);
    return NextResponse.json({ error: 'خطای سرور در ثبت سفارش.' }, { status: 500 });
  }
}

// پیگیری سفارش: کد رهگیری + موبایل
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();
    const phone = (searchParams.get('phone') || '').trim();
    if (!code || !phone) {
      return NextResponse.json({ error: 'کد رهگیری و شماره موبایل را وارد کنید.' }, { status: 400 });
    }
    const normalize = (s) => normalizePhone(s);

    await connectDB();
    const order = await Order.findOne({ code }).lean();
    if (!order || normalize(order.customer.phone) !== normalize(phone)) {
      return NextResponse.json({ error: 'سفارشی با این مشخصات یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({
      code: order.code,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items,
    });
  } catch (e) {
    console.error('GET /api/orders:', e);
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 });
  }
}
