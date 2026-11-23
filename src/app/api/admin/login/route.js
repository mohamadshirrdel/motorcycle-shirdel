import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { signAdmin, ADMIN_COOKIE } from '@/lib/auth';
import { normalizePhone, normalizeEmail } from '@/lib/userAuth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور الزامی است.' }, { status: 400 });
    }
    const id = String(username).trim();
    const idLower = id.toLowerCase();

    await connectDB();

    const phone = normalizePhone(id);
    const email = normalizeEmail(id);
    const findAdmin = () =>
      User.findOne({
        role: 'admin',
        $or: [
          { username: idLower },
          ...(phone && /^09\d{9}$/.test(phone) ? [{ phone }] : []),
          ...(email.includes('@') ? [{ email }] : []),
        ],
      });

    let user = await findAdmin();

    // راه‌اندازی اولیه: فقط وقتی هیچ ادمین فعالی وجود ندارد، با .env.local احیا کن
    const envUser = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD || '';
    const matchesEnv = envUser && envPass && idLower === envUser && String(password) === envPass;
    if (!user && matchesEnv) {
      const activeAdmins = await User.countDocuments({ role: 'admin', banned: { $ne: true } });
      if (activeAdmins === 0) {
        const passwordHash = await bcrypt.hash(envPass, 10);
        const envPhone = normalizePhone(process.env.ADMIN_PHONE || '');
        // اگر کاربر هم‌نام از قبل وجود دارد، ارتقا بده — وگرنه بساز
        const existing = await User.findOne({
          $or: [{ username: envUser }, ...(envPhone ? [{ phone: envPhone }] : [])],
        });
        if (existing) {
          existing.role = 'admin';
          existing.banned = false;
          existing.passwordHash = passwordHash;
          existing.username = existing.username || envUser;
          await existing.save();
          user = existing;
        } else {
          user = await User.create({
            name: process.env.ADMIN_NAME || 'محمد',
            username: envUser,
            phone: envPhone,
            email: '',
            passwordHash,
            role: 'admin',
            banned: false,
          });
        }
      }
    }

    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است.' }, { status: 401 });
    }
    if (user.banned) {
      return NextResponse.json({ error: 'این حساب مسدود شده است.' }, { status: 403 });
    }

    const payload = {
      sub: String(user._id),
      username: user.username || user.email || user.phone || String(user._id),
      name: user.name,
      role: 'admin',
    };
    const token = signAdmin(payload);
    const res = NextResponse.json({ ok: true, name: payload.name, role: payload.role });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error('POST /api/admin/login:', e);
    return NextResponse.json({ error: 'خطای سرور.' }, { status: 500 });
  }
}
