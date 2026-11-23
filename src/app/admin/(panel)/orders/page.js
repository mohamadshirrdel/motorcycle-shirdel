'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, ShoppingCart, ChevronLeft, Phone, MapPin, StickyNote } from 'lucide-react';
import { ORDER_STATUS, formatPrice, formatDate, formatNumber } from '@/lib/format';
import Pagination from '@/components/admin/Pagination';


const FILTERS = [
  ['', 'همه'],
  ['pending', 'در انتظار'],
  ['paid', 'پرداخت‌شده'],
  ['processing', 'آماده‌سازی'],
  ['shipped', 'ارسال‌شده'],
  ['delivered', 'تحویل‌شده'],
  ['cancelled', 'لغوشده'],
];

const PER_PAGE = 8;

export default function AdminOrdersPage()
 {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setOrders(null);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}&q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setOrders(data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  }, [filter, q]);

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  useEffect(() => {
    if (orders) {
      const tp = Math.max(1, Math.ceil(orders.length / PER_PAGE));
      if (page > tp) setPage(tp);
    }
  }, [orders, page]);

  const onSearch = (e) => { e.preventDefault(); load(); };

  const changeStatus = async (id, status) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.status } : o)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving('');
    }
  };

  const paged = (orders || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);


  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">مدیریت</p>
      <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-black text-strong"><ShoppingCart size={22} className="text-accent" /> سفارش‌ها</h1>

      {/* فیلترها */}
      <div className="mt-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(([key, label]) => (
            <button key={key || 'all'} onClick={() => setFilter(key)} className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${filter === key ? 'bg-accent text-white' : 'border border-line bg-panel2 text-soft hover:text-strong'}`}>{label}</button>
          ))}
        </div>
        <form onSubmit={onSearch} className="flex w-full max-w-xs gap-2">
          <input className="input !py-2 text-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="کد سفارش یا موبایل…" />
          <button type="submit" className="btn-ghost !px-3 !py-2"><Search size={16} /></button>
        </form>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-4 space-y-3">
        {!orders ? (
          <div className="card flex min-h-[260px] items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted">سفارشی در این وضعیت ثبت نشده است.</div>
        ) : (
          paged.map((o) => {
            const st = ORDER_STATUS[o.status];
            const isOpen = expanded === o._id;
            return (
              <div key={o._id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-[110px]">
                    <p dir="ltr" style={{ textAlign: 'right' }} className="font-mono text-xs font-black text-gold">{o.code}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="min-w-[140px] flex-1">
                    <p className="text-sm font-bold text-strong">{o.customer?.name}</p>
                    <p dir="ltr" style={{ textAlign: 'right' }} className="text-[10px] text-muted">{o.customer?.phone}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-strong">{formatPrice(o.total)}</p>
                    <p className="text-[10px] text-muted">{o.paymentMethod === 'online' ? 'آنلاین' : 'پرداخت در محل'} — {o.items?.length?.toLocaleString('fa-IR')} قلم</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select value={o.status} disabled={saving === o._id} onChange={(e) => changeStatus(o._id, e.target.value)} className="appearance-none rounded-lg border border-line bg-panel2 py-2 pl-8 pr-3 text-[11px] font-bold text-strong outline-none focus:border-accent">
                        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      {saving === o._id ? <Loader2 size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 animate-spin text-muted" /> : <ChevronLeft size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rotate-[-90deg] text-muted" />}
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : o._id)} className="rounded-lg border border-line px-3 py-2 text-[11px] font-bold text-soft transition hover:border-accent hover:text-strong">{isOpen ? 'بستن' : 'جزئیات'}</button>
                  </div>
                </div>

                {/* جزئیات بازشونده */}
                {isOpen && (
                  <div className="border-t border-line bg-panel2/30 p-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-black uppercase text-muted">اقلام سفارش</p>
                        <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                          {o.items?.map((i, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-panel2/50 p-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {i.image && <img src={i.image} alt="" className="h-12 w-16 rounded-md bg-stage object-contain p-1" />}
                              <span className="min-w-0 flex-1 text-xs text-body">{i.title} <span className="text-muted">×{i.qty?.toLocaleString('fa-IR')}</span></span>
                              <span className="text-xs font-bold text-strong">{formatPrice(i.price * i.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div><p className="flex items-center gap-1.5 font-black text-muted"><Phone size={12} /> تماس</p><a href={`tel:${o.customer?.phone}`} dir="ltr" style={{ textAlign: 'right' }} className="mt-1 block font-bold text-gold hover:underline">{o.customer?.phone}</a></div>
                        <div><p className="flex items-center gap-1.5 font-black text-muted"><MapPin size={12} /> آدرس تحویل</p><p className="mt-1 leading-6 text-body">{o.customer?.city ? `${o.customer.city} — ` : ''}{o.customer?.address || '—'}</p></div>
                        {o.note && <div><p className="flex items-center gap-1.5 font-black text-muted"><StickyNote size={12} /> توضیح مشتری</p><p className="mt-1 leading-6 text-body">{o.note}</p></div>}
                        <div><span className={`chip ${st?.cls}`}>{st?.label}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <Pagination total={orders?.length || 0} page={page} perPage={PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
