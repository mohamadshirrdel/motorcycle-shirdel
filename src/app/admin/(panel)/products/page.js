'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import { formatPrice, effectivePrice, formatNumber } from '@/lib/format';
import Pagination from '@/components/admin/Pagination';

const PER_PAGE = 8;


export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = async (query = q) => {
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setProducts(data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(''); }, []);

  useEffect(() => {
    if (products) {
      const tp = Math.max(1, Math.ceil(products.length / PER_PAGE));
      if (page > tp) setPage(tp);
    }
  }, [products, page]);

  const onSearch = (e) => {
    e.preventDefault();
    setProducts(null);
    load(q);
  };

  const onDelete = async (id, title) => {
    if (!confirm(`محصول «${title}» حذف شود؟`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('حذف ناموفق بود');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting('');
    }
  };

  const paged = (products || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);


  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">مدیریت</p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-black text-strong"><Package size={22} className="text-accent" /> محصولات</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary"><Plus size={18} /> محصول جدید</Link>
      </div>

      <form onSubmit={onSearch} className="mt-5 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pr-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی عنوان محصول…" />
        </div>
        <button type="submit" className="btn-ghost !px-4">جستجو</button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="card mt-4 overflow-x-auto">
        {!products ? (
          <div className="flex min-h-[280px] items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">محصولی یافت نشد.</p>
        ) : (
          <table className="w-full min-w-[820px]">
            <thead className="bg-panel2/50"><tr>
              <th className="th">محصول</th><th className="th">برند</th><th className="th">قیمت</th><th className="th">موجودی</th><th className="th">ویژه</th><th className="th">عملیات</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {paged.map((p) => (
                <tr key={p._id} className="transition hover:bg-panel2/40">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0]} alt="" className="h-14 w-20 rounded-lg bg-stage object-contain p-1" />
                      <span className="line-clamp-2 max-w-[240px] text-xs font-bold text-strong">{p.title}</span>
                    </div>
                  </td>
                  <td className="td text-xs text-muted">{p.brand}</td>
                  <td className="td text-xs font-bold text-strong">{formatPrice(effectivePrice(p))}</td>
                  <td className="td">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black ${p.stock === 0 ? 'bg-red-500/15 text-red-400' : p.stock <= 2 ? 'bg-gold/10 text-gold' : 'bg-green-500/10 text-green-400'}`}>{p.stock === 0 ? 'ناموجود' : `${formatNumber(p.stock)} دستگاه`}</span>
                  </td>
                  <td className="td text-xs">{p.featured ? '⭐' : '—'}</td>
                  <td className="td">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/products/${p._id}/edit`} className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-strong" aria-label="ویرایش"><Pencil size={15} /></Link>
                      <button onClick={() => onDelete(p._id, p.title)} disabled={deleting === p._id} className="rounded-lg border border-line p-2 text-muted transition hover:border-red-500 hover:text-red-400" aria-label="حذف">
                        {deleting === p._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination total={products?.length || 0} page={page} perPage={PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
