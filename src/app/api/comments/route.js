import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment, Product } from '@/lib/models';

// ثبت کامنت جدید (پس از تأیید مدیر نمایش داده می‌شود)
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, name, text, rating } = body || {};

    if (!productId || !name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'نام و متن دیدگاه الزامی است.' }, { status: 400 });
    }
    if (String(name).length > 80 || String(text).length > 1000) {
      return NextResponse.json({ error: 'متن بیش از حد مجاز است.' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId).select('title').lean();
    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد.' }, { status: 404 });
    }

    const comment = await Comment.create({
      product: product._id,
      productTitle: product.title,
      name: String(name).trim(),
      text: String(text).trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      status: 'pending',
    });

    return NextResponse.json({ ok: true, id: String(comment._id) }, { status: 201 });
  } catch (e) {
    console.error('POST /api/comments:', e);
    return NextResponse.json({ error: 'خطای سرور در ثبت دیدگاه.' }, { status: 500 });
  }
}
