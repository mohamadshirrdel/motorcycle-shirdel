import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';
import { normalizePhone, normalizeEmail } from '@/lib/userAuth';

// ویرایش کامل کاربر: نقش، نام، نام کاربری، موبایل، ایمیل و مسدودی
export async function PATCH(request, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const isSelf = String(session?.sub) === String(id);
  const body = await request.json();

  await connectDB();
  const target = await User.findById(id);
  if (!target) return NextResponse.json({ error: 'کاربر یافت نشد.' }, { status: 404 });

  const update = {};

  // ---- نام ----
  if (body.name !== undefined) {
    const name = String(body.name).trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: 'نام نمی‌تواند خالی باشد.' }, { status: 400 });
    update.name = name;
  }

  // ---- نام کاربری ----
  if (body.username !== undefined) {
    const username = String(body.username).trim().toLowerCase();
    if (username) {
      if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
        return NextResponse.json({ error: 'نام کاربری باید ۳ تا ۳۰ کاراکتر و فقط شامل a-z، ۰-۹، _ . - باشد.' }, { status: 400 });
      }
      const dup = await User.findOne({ username, _id: { $ne: target._id } }).select('_id').lean();
      if (dup) return NextResponse.json({ error: 'این نام کاربری قبلاً استفاده شده است.' }, { status: 409 });
      update.username = username;
    } else {
      update.username = undefined; // حذف نام کاربری (sparse → باید با $unset حذف شود)
    }
  }

  // ---- موبایل ----
  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (phone && !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل باید با 09 شروع و ۱۱ رقم باشد.' }, { status: 400 });
    }
    if (phone) {
      const dup = await User.findOne({ phone, _id: { $ne: target._id } }).select('_id').lean();
      if (dup) return NextResponse.json({ error: 'این شماره موبایل به کاربر دیگری تعلق دارد.' }, { status: 409 });
    }
    update.phone = phone;
  }

  // ---- ایمیل ----
  if (body.email !== undefined) {
    const email = normalizeEmail(body.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست.' }, { status: 400 });
    }
    if (email) {
      const dup = await User.findOne({ email, _id: { $ne: target._id } }).select('_id').lean();
      if (dup) return NextResponse.json({ error: 'این ایمیل به کاربر دیگری تعلق دارد.' }, { status: 409 });
    }
    update.email = email;
  }

  // ---- نقش ----
  if (body.role !== undefined) {
    if (!['user', 'admin'].includes(body.role)) {
      return NextResponse.json({ error: 'نقش نامعتبر است.' }, { status: 400 });
    }
    if (isSelf && body.role !== target.role) {
      return NextResponse.json({ error: 'نمی‌توانید نقش خودتان را تغییر دهید.' }, { status: 400 });
    }
    // آخرین ادمینِ فعال نباید تنزل پیدا کند
    if (target.role === 'admin' && body.role === 'user') {
      const activeAdmins = await User.countDocuments({ role: 'admin', banned: { $ne: true } });
      if (activeAdmins <= 1) {
        return NextResponse.json({ error: 'حداقل یک ادمین فعال باید باقی بماند؛ اول ادمین دیگری بسازید.' }, { status: 400 });
      }
    }
    update.role = body.role;
  }

  // ---- مسدودی / رفع مسدودی ----
  if (body.banned !== undefined) {
    const banned = Boolean(body.banned);
    if (isSelf && banned) {
      return NextResponse.json({ error: 'نمی‌توانید حساب خودتان را مسدود کنید.' }, { status: 400 });
    }
    // آخرین ادمین فعال را نمی‌توان مسدود کرد
    if (target.role === 'admin' && banned && !target.banned) {
      const activeAdmins = await User.countDocuments({ role: 'admin', banned: { $ne: true } });
      if (activeAdmins <= 1) {
        return NextResponse.json({ error: 'آخرین ادمین فعال را نمی‌توان مسدود کرد.' }, { status: 400 });
      }
    }
    update.banned = banned;
  }

  // اعمال به‌روزرسانی (با پشتیبانی از حذف username)
  const $set = {};
  const $unset = {};
  for (const [k, v] of Object.entries(update)) {
    if (v === undefined) $unset[k] = 1;
    else $set[k] = v;
  }
  const ops = {};
  if (Object.keys($set).length) ops.$set = $set;
  if (Object.keys($unset).length) ops.$unset = $unset;

  const user =
    Object.keys(ops).length > 0
      ? await User.findByIdAndUpdate(id, ops, { returnDocument: 'after' }).lean()
      : target.toObject();

  return NextResponse.json({
    ok: true,
    user: {
      id: String(user._id),
      name: user.name,
      username: user.username || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role,
      banned: Boolean(user.banned),
    },
  });
}
