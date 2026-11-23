import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';

// ثبت تیکت جدید پشتیبانی
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, orderCode } = body || {};

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'همه فیلدهای ضروری را کامل کنید.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست.' }, { status: 400 });
    }
    if (String(message).length > 2000 || String(subject).length > 120) {
      return NextResponse.json({ error: 'متن بیش از حد مجاز است.' }, { status: 400 });
    }

    await connectDB();
    const code = `T-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0')}`;

    const ticket = await Ticket.create({
      code,
      name: String(name).trim().slice(0, 80),
      email: String(email).trim().slice(0, 80),
      subject: String(subject).trim().slice(0, 120),
      message: String(message).trim().slice(0, 2000),
      orderCode: String(orderCode || '').trim().slice(0, 30),
      status: 'open',
      replies: [],
    });

    return NextResponse.json({ ok: true, code: ticket.code }, { status: 201 });
  } catch (e) {
    console.error('POST /api/tickets:', e);
    return NextResponse.json({ error: 'خطای سرور در ثبت تیکت.' }, { status: 500 });
  }
}

// دریافت تیکت برای نمایش عمومی (کد تیکت نقش کلید دسترسی را دارد)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();
    if (!code) return NextResponse.json({ error: 'کد تیکت را وارد کنید.' }, { status: 400 });

    await connectDB();
    const ticket = await Ticket.findOne({ code }).lean();
    if (!ticket) return NextResponse.json({ error: 'تیکتی با این کد یافت نشد.' }, { status: 404 });

    return NextResponse.json({
      code: ticket.code,
      name: ticket.name,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      orderCode: ticket.orderCode,
      createdAt: ticket.createdAt,
      replies: ticket.replies,
    });
  } catch (e) {
    console.error('GET /api/tickets:', e);
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 });
  }
}

// افزودن پاسخ کاربر به تیکت
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { code, text } = body || {};
    if (!code || !text?.trim()) {
      return NextResponse.json({ error: 'متن پاسخ الزامی است.' }, { status: 400 });
    }
    if (String(text).length > 1500) {
      return NextResponse.json({ error: 'متن بیش از حد مجاز است.' }, { status: 400 });
    }

    await connectDB();
    const ticket = await Ticket.findOneAndUpdate(
      { code: String(code).trim().toUpperCase(), status: { $ne: 'closed' } },
      {
        $push: { replies: { author: 'user', text: String(text).trim(), createdAt: new Date() } },
        $set: { status: 'open' },
      },
      { returnDocument: 'after' }
    ).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'تیکت یافت نشد یا بسته شده است.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, replies: ticket.replies, status: ticket.status });
  } catch (e) {
    console.error('PATCH /api/tickets:', e);
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 });
  }
}
