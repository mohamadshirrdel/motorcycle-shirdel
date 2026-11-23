'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LifeBuoy, Loader2, User, ShoppingBag } from 'lucide-react';
import { TICKET_STATUS, formatDate } from '@/lib/format';
import Pagination from '@/components/admin/Pagination';


const TABS = [
  ['open', 'باز'],
  ['answered', 'پاسخ داده شده'],
  ['closed', 'بسته شده'],
  ['', 'همه'],
];

const PER_PAGE = 10;

export default function AdminTicketsPage()
 {
  const [tickets, setTickets] = useState(null);
  const [tab, setTab] = useState('open');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setTickets(null);
    try {
      const res = await fetch(`/api/admin/tickets?status=${tab}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setTickets(data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tickets) {
      const tp = Math.max(1, Math.ceil(tickets.length / PER_PAGE));
      if (page > tp) setPage(tp);
    }
  }, [tickets, page]);

  const paged = (tickets || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);


  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">مدیریت</p>
      <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-black text-strong"><LifeBuoy size={22} className="text-accent" /> تیکت‌های پشتیبانی</h1>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map(([key, label]) => (
          <button key={key || 'all'} onClick={() => setTab(key)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${tab === key ? 'bg-accent text-white' : 'border border-line bg-panel2 text-soft hover:text-strong'}`}>{label}</button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-4 space-y-3">
        {!tickets ? (
          <div className="card flex min-h-[260px] items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : tickets.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted">تیکتی در این بخش نیست 🎉</div>
        ) : (
          paged.map((t) => {
            const st = TICKET_STATUS[t.status] || TICKET_STATUS.open;
            return (
              <Link key={t._id} href={`/admin/tickets/${t._id}`} className="card flex flex-wrap items-center gap-4 p-4 transition hover:border-accent/40">
                <span dir="ltr" style={{ textAlign: 'right' }} className="font-mono text-xs font-black text-gold">{t.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold text-strong">{t.subject}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted">
                    <span className="flex items-center gap-1"><User size={11} />{t.name}</span>
                    {t.orderCode && <span className="flex items-center gap-1"><ShoppingBag size={11} />{t.orderCode}</span>}
                    <span>{formatDate(t.updatedAt)}</span>
                    <span>{(t.replies?.length || 0).toLocaleString('fa-IR')} پاسخ</span>
                  </p>
                </div>
                <span className={`chip ${st.cls}`}>{st.label}</span>
              </Link>
            );
          })
        )}
      </div>
      <Pagination total={tickets?.length || 0} page={page} perPage={PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
