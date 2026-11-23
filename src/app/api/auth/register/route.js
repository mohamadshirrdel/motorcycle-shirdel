import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { signUser, normalizePhone, normalizeEmail, USER_COOKIE } from '@/lib/userAuth';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim().slice(0, 80);
    const phone = normalizePhone(body?.phone);
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || '');

    if (!name) return NextResponse.json({ error: 'نام را وارد کنید.' }, { status: 400 });
    if (!phone && !email) {
      return NextResponse.json({ error: 'حداقل یکی از شماره موبایل یا ایمیل را وارد کنید.' }, { status: 400 });
    }
    if (phone && !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل باید با 09 شروع و ۱۱ رقم باشد.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }, { status: 400 });
    }

    await connectDB();

    const dup = await User.findOne({ $or: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])] }).select('phone email').lean();
    if (dup) {
      if (phone && dup.phone === phone) return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است.' }, { status: 409 });
      return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده است.' }, { status: 409 });
    }

    const user = await User.create({
      name,
      phone,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });

    const token = signUser({ sub: String(user._id), name: user.name, phone: user.phone, email: user.email });
    const res = NextResponse.json({ ok: true, name: user.name }, { status: 201 });
    res.cookies.set(USER_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (e) {
    console.error('POST /api/auth/register:', e);
    return NextResponse.json({ error: 'خطای سرور در ثبت‌نام.' }, { status: 500 });
  }
}
