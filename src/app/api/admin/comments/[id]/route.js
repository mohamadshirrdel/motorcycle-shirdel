import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment, Product } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

async function recomputeProductRating(productId) {
  const stats = await Comment.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: 'approved' } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const s = stats[0];
  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ratingAvg: s ? Math.round(s.avg * 10) / 10 : 0,
        ratingCount: s ? s.count : 0,
      },
    }
  );
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { action } = await request.json();
  const map = { approve: 'approved', reject: 'rejected' };
  if (!map[action]) return NextResponse.json({ error: 'عملیات نامعتبر است.' }, { status: 400 });

  await connectDB();
  const comment = await Comment.findByIdAndUpdate(id, { status: map[action] }, { returnDocument: 'after' });
  if (!comment) return NextResponse.json({ error: 'کامنت یافت نشد.' }, { status: 404 });
  await recomputeProductRating(comment.product);
  return NextResponse.json({ ok: true, status: comment.status });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  await connectDB();
  const comment = await Comment.findByIdAndDelete(id);
  if (!comment) return NextResponse.json({ error: 'کامنت یافت نشد.' }, { status: 404 });
  await recomputeProductRating(comment.product);
  return NextResponse.json({ ok: true });
}
