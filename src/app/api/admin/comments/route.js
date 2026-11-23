import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment, Product } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  await connectDB();
  const filter = status ? { status } : {};
  const comments = await Comment.find(filter).sort({ createdAt: -1 }).limit(300).lean();
  return NextResponse.json(comments.map((c) => ({ ...c, _id: String(c._id), product: String(c.product) })));
}
