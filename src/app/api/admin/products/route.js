import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `item-${Date.now().toString(36)}`;

// لیست محصولات برای پنل (جستجو + فیلتر)
export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  await connectDB();
  const filter = q ? { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    products.map((p) => ({ ...p, _id: String(p._id) }))
  );
}

// افزودن محصول جدید
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const b = await request.json();
    if (!b.title?.trim() || !b.brand?.trim() || !b.price) {
      return NextResponse.json({ error: 'عنوان، برند و قیمت الزامی است.' }, { status: 400 });
    }

    await connectDB();
    let slug = b.slug?.trim() ? slugify(b.slug) : slugify(b.title);
    // یکتاسازی اسلاگ
    const exists = await Product.findOne({ slug }).select('_id').lean();
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;

    const price = Number(b.price);
    const discountPrice = b.discountPrice ? Number(b.discountPrice) : null;

    const product = await Product.create({
      title: String(b.title).trim(),
      slug,
      brand: String(b.brand).trim(),
      category: b.category || 'sport',
      engine: b.engine || '',
      power: b.power || '',
      torque: b.torque || '',
      weight: b.weight || '',
      topSpeed: b.topSpeed || '',
      fuelTank: b.fuelTank || '',
      warranty: b.warranty || 'گارانتی اصالت و سلامت کالا',
      price,
      discountPrice: discountPrice && discountPrice < price ? discountPrice : null,
      stock: Math.max(0, Number(b.stock) || 0),
      colors: Array.isArray(b.colors) ? b.colors : String(b.colors || '').split(',').map((s) => s.trim()).filter(Boolean),
      images: Array.isArray(b.images) ? b.images.filter(Boolean) : String(b.images || '').split('\n').map((s) => s.trim()).filter(Boolean),
      shortDesc: b.shortDesc || '',
      description: b.description || '',
      featured: Boolean(b.featured),
      ratingAvg: 4.5,
      ratingCount: 0,
      sold: 0,
    });

    return NextResponse.json({ ok: true, id: String(product._id), slug: product.slug }, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/products:', e);
    return NextResponse.json({ error: 'خطای سرور در ثبت محصول.' }, { status: 500 });
  }
}
