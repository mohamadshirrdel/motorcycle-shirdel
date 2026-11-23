import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(_req, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const p = await Product.findById(id).lean();
  if (!p) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
  return NextResponse.json({ ...p, _id: String(p._id) });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const b = await request.json();
    await connectDB();

    const price = Number(b.price);
    const discountPrice = b.discountPrice ? Number(b.discountPrice) : null;

    const update = {
      title: String(b.title || '').trim(),
      brand: String(b.brand || '').trim(),
      category: b.category || 'sport',
      engine: b.engine || '',
      power: b.power || '',
      torque: b.torque || '',
      weight: b.weight || '',
      topSpeed: b.topSpeed || '',
      fuelTank: b.fuelTank || '',
      warranty: b.warranty || '',
      price,
      discountPrice: discountPrice && discountPrice < price ? discountPrice : null,
      stock: Math.max(0, Number(b.stock) || 0),
      colors: Array.isArray(b.colors) ? b.colors : String(b.colors || '').split(',').map((s) => s.trim()).filter(Boolean),
      images: Array.isArray(b.images) ? b.images.filter(Boolean) : String(b.images || '').split('\n').map((s) => s.trim()).filter(Boolean),
      shortDesc: b.shortDesc || '',
      description: b.description || '',
      featured: Boolean(b.featured),
    };
    if (b.slug?.trim()) update.slug = String(b.slug).trim();

    const p = await Product.findByIdAndUpdate(id, update, { returnDocument: 'after' }).lean();
    if (!p) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
    return NextResponse.json({ ok: true, id: String(p._id), slug: p.slug });
  } catch (e) {
    console.error('PUT /api/admin/products/[id]:', e);
    return NextResponse.json({ error: 'خطای سرور در ویرایش محصول.' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const p = await Product.findByIdAndDelete(id).lean();
  if (!p) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
