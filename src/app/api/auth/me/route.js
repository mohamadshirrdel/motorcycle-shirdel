import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/userAuth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    username: user.username || '',
  });
}
