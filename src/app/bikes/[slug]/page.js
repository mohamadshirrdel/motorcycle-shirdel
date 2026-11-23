import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Star, Gauge, Weight, Fuel, Users, BadgeCheck, Cog } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { Product, Comment } from '@/lib/models';
import { getRelatedProducts, serialize } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import BuyPanel from '@/components/BuyPanel';
import CommentSection from '@/components/CommentSection';
import { categoryLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const p = await Product.findOne({ slug }).lean();
    if (!p) return { title: 'یافت نشد' };
    return { title: p.title, description: p.shortDesc };
  } catch {
    return { title: 'محصول' };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  if (!product) notFound();
  const p = serialize(product);

  const [comments, related] = await Promise.all([
    Comment.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 }).lean(),
    getRelatedProducts(product, 4),
  ]);
  const approved = comments.map(serialize);
  const rel = related.map(serialize);

  const specs = [
    ['حجم موتور', p.engine, Cog],
    ['قدرت', p.power, Gauge],
    ['گشتاور', p.torque, Gauge],
    ['وزن خشک', p.weight, Weight],
    ['حداکثر سرعت', p.topSpeed, Gauge],
    ['باک', p.fuelTank, Fuel],
    ['گارانتی', p.warranty, BadgeCheck],
  ].filter(([, v]) => v);

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      {/* مسیر صفحه */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
        <Link href="/" className="hover:text-strong">خانه</Link>
        <ChevronLeft size={12} />
        <Link href="/bikes" className="hover:text-strong">محصولات</Link>
        <ChevronLeft size={12} />
        <Link href={`/bikes?category=${p.category}`} className="hover:text-strong">{categoryLabel(p.category)}</Link>
        <ChevronLeft size={12} />
        <span className="max-w-[46vw] truncate text-soft">{p.title}</span>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* گالری */}
        <div className="lg:col-span-3">
          <ProductGallery images={p.images} title={p.title} />
        </div>

        {/* اطلاعات خرید */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">{p.brand}</p>
          <h1 className="mt-1.5 text-2xl font-black leading-9 text-strong sm:text-3xl">{p.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><Star size={13} className="fill-gold text-gold" /> {p.ratingAvg?.toLocaleString('fa-IR')} از ۵ ({p.ratingCount?.toLocaleString('fa-IR')} رأی)</span>
            <span>{p.sold?.toLocaleString('fa-IR') || '۰'} دستگاه فروخته شد</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-soft">{p.shortDesc}</p>
          <div className="mt-5">
            <BuyPanel product={p} />
          </div>
        </div>
      </div>

      {/* مشخصات فنی */}
      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3">
          <h2 className="border-b border-line bg-panel2/60 px-6 py-4 font-black text-strong">مشخصات فنی</h2>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <tbody>
              {specs.map(([label, value, Icon]) => (
                <tr key={label} className="spec-row border-b border-line/60 last:border-0">
                  <td className="w-28 px-4 py-3 text-muted sm:w-40 sm:px-6"><span className="flex items-center gap-2"><Icon size={14} className="text-accent" />{label}</span></td>
                  <td className="px-6 py-3 font-bold text-strong">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="font-black text-strong">درباره این موتور</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-8 text-soft">{p.description}</p>
          {p.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-muted">رنگ‌های موجود:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.colors.map((c) => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* کامنت‌ها */}
      <CommentSection productId={p._id} productTitle={p.title} initialComments={approved} />

      {/* محصولات مرتبط */}
      {rel.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-black text-strong">شاید این‌ها را هم بپسندید</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {rel.map((r) => <ProductCard key={r._id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
