import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { signUser, normalizePhone, normalizeEmail, USER_COOKIE } from '@/lib/userAuth';

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body?.identifier || '').trim();
    const password = String(body?.password || '');
    if (!identifier || !password) {
      return NextResponse.json({ error: 'نام کاربری، شماره موبایل یا ایمیل و رمز عبور را وارد کنید.' }, { status: 400 });
    }

    const phone = normalizePhone(identifier);
    const email = normalizeEmail(identifier);
    const username = identifier.toLowerCase();

    await connectDB();
    const user = await User.findOne({
      $or: [
        ...(phone && /^09\d{9}$/.test(phone) ? [{ phone }] : []),
        ...(email.includes('@') ? [{ email }] : []),
        { username },
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'اطلاعات ورود اشتباه است.' }, { status: 401 });
    }
    if (user.banned) {
      return NextResponse.json({ error: 'حساب شما مسدود شده است. برای رفع مسدودی با پشتیبانی تماس بگیرید: ۰۵۱-۵۲۲۸۱۲۳۴' }, { status: 403 });
    }

    const token = signUser({ sub: String(user._id), name: user.name, phone: user.phone, email: user.email });
    const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
    res.cookies.set(USER_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (e) {
    console.error('POST /api/auth/login:', e);
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 });
  }
}
