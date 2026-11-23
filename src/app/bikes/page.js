import Link from 'next/link';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { queryProducts } from '@/lib/data';
import { serialize } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES, BRANDS } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'محصولات' };

function buildQuery(current, overrides) {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  return `/bikes?${params.toString()}`;
}

export default async function BikesPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = sp.q || '';
  const brand = sp.brand || '';
  const category = sp.category || '';
  const sort = sp.sort || '';
  const current = { q, brand, category, sort };

  let products = [];
  let dbError = false;
  try {
    products = (await queryProducts({ q, brand, category, sort })).map(serialize);
  } catch (e) {
    console.error('DB error on /bikes:', e.message);
    dbError = true;
  }

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      {/* سربرگ */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">کاتالوگ</p>
          <h1 className="mt-2 text-3xl font-black text-strong">همه موتورسیکلت‌ها</h1>
          <p className="mt-1 text-sm text-muted">{products.length.toLocaleString('fa-IR')} مدل موجود است</p>
        </div>
        {/* جستجو */}
        <form action="/bikes" className="flex w-full max-w-md items-center gap-2">
          {brand && <input type="hidden" name="brand" value={brand} />}
          {category && <input type="hidden" name="category" value={category} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <input name="q" defaultValue={q} placeholder="جستجوی مدل، برند یا حجم موتور…" className="input" />
          <button type="submit" className="btn-primary !px-4" aria-label="جستجو"><SlidersHorizontal size={18} /></button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* فیلترها */}
        <aside className="h-fit space-y-6 rounded-2xl border border-line bg-panel p-5">
          <div>
            <p className="mb-2 text-xs font-black text-muted">دسته‌بندی</p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              <Link href={buildQuery(current, { category: '' })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${!category ? 'bg-accent text-white' : 'text-soft hover:bg-panel2'}`}>همه دسته‌ها</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.key} href={buildQuery(current, { category: c.key })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${category === c.key ? 'bg-accent text-white' : 'text-soft hover:bg-panel2'}`}>{c.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black text-muted">برند</p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              <Link href={buildQuery(current, { brand: '' })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${!brand ? 'bg-panel3 text-strong' : 'text-soft hover:bg-panel2'}`}>همه برندها</Link>
              {BRANDS.map((b) => (
                <Link key={b} href={buildQuery(current, { brand: b })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${brand === b ? 'bg-panel3 text-strong' : 'text-soft hover:bg-panel2'}`}>{b}</Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black text-muted">مرتب‌سازی</p>
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
              {[
                ['', 'جدیدترین'],
                ['price-asc', 'ارزان‌ترین'],
                ['price-desc', 'گران‌ترین'],
                ['rating', 'محبوب‌ترین'],
                ['sold', 'پرفروش‌ترین'],
              ].map(([key, label]) => (
                <Link key={key || 'new'} href={buildQuery(current, { sort: key })} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${sort === key ? 'bg-panel3 text-strong' : 'text-soft hover:bg-panel2'}`}>{label}</Link>
              ))}
            </div>
          </div>

          {(q || brand || category || sort) && (
            <Link href="/bikes" className="block rounded-xl border border-line py-2 text-center text-xs font-bold text-muted transition hover:border-accent hover:text-strong">حذف فیلترها ×</Link>
          )}
        </aside>

        {/* نتایج */}
        <section>
          {dbError ? (
            <div className="card p-10 text-center text-muted">اتصال به پایگاه‌داده برقرار نشد. MongoDB را اجرا کنید یا <code className="text-gold">MONGODB_URI</code> را در .env.local تنظیم کنید.</div>
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <SearchX size={40} className="text-muted" />
              <h2 className="font-black text-strong">چیزی پیدا نشد</h2>
              <p className="text-sm text-muted">عبارت دیگری جستجو کنید یا فیلترها را حذف کنید.</p>
              <Link href="/bikes" className="btn-ghost mt-2">حذف فیلترها</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
