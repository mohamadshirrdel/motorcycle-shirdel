import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'shirdel-dev-secret-change-me';
const COOKIE_NAME = 'shirdel_admin';

export function signAdmin(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdmin(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// خواندن نشست مدیر در Route Handler ها و Server Components
export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdmin(token);
}

// برای Route Handler های مدیر — نقش از دیتابیس چک می‌شود، نه فقط JWT
// (تنزل/مسدودی ادمین بلافاصله اثر می‌کند)
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.sub) return { error: 'unauthorized' };
  try {
    await connectDB();
    const user = await User.findById(session.sub).select('role banned name').lean();
    if (!user || user.banned || user.role !== 'admin') return { error: 'unauthorized' };
    return { session: { ...session, name: user.name } };
  } catch {
    return { error: 'unauthorized' };
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
