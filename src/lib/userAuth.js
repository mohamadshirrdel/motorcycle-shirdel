import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'shirdel-dev-secret-change-me';
const COOKIE_NAME = 'shirdel_user';

export function normalizePhone(s) {
  return String(s || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '')
    .replace(/^0098/, '0')
    .replace(/^98(?=9)/, '0');
}

export function normalizeEmail(s) {
  return String(s || '').trim().toLowerCase();
}

export function signUser(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyUser(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getUserSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUser(token);
}

export const USER_COOKIE = COOKIE_NAME;

// کاربر زندهٔ حساب: سشن + وجود در دیتابیس + عدم مسدودی
export async function getCurrentUser() {
  const session = await getUserSession();
  if (!session?.sub) return null;
  try {
    await connectDB();
    const u = await User.findById(session.sub).select('-passwordHash').lean();
    if (!u || u.banned) return null;
    return u;
  } catch {
    return null;
  }
}
