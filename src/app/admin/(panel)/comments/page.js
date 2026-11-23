'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, X, Trash2, Loader2, MessageSquare, Star } from 'lucide-react';
import { formatDate } from '@/lib/format';
import Pagination from '@/components/admin/Pagination';


const TABS = [
  ['pending', 'در انتظار تأیید'],
  ['approved', 'منتشر شده'],
  ['rejected', 'رد شده'],
  ['', 'همه'],
];

const PER_PAGE = 8;

export default function AdminCommentsPage()
 {
  const [comments, setComments] = useState(null);
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setComments(null);
    try {
      const res = await fetch(`/api/admin/comments?status=${tab}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setComments(data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (comments) {
      const tp = Math.max(1, Math.ceil(comments.length / PER_PAGE));
      if (page > tp) setPage(tp);
    }
  }, [comments, page]);

  const act = async (id, action) => {
    setBusy(id + action);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('عملیات ناموفق بود');
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy('');
    }
  };

  const remove = async (id) => {
    if (!confirm('این کامنت برای همیشه حذف شود؟')) return;
    setBusy(id + 'delete');
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('حذف ناموفق بود');
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy('');
    }
  };

  const paged = (comments || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);


  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">مدیریت</p>
      <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-black text-strong"><MessageSquare size={22} className="text-accent" /> دیدگاه‌ها و کامنت‌ها</h1>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map(([key, label]) => (
          <button key={key || 'all'} onClick={() => setTab(key)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${tab === key ? 'bg-accent text-white' : 'border border-line bg-panel2 text-soft hover:text-strong'}`}>{label}</button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {!comments ? (
          <div className="col-span-full flex min-h-[260px] items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : comments.length === 0 ? (
          <p className="col-span-full card p-10 text-center text-sm text-muted">کامنتی در این بخش نیست.</p>
        ) : (
          paged.map((c) => (
            <article key={c._id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel3 text-xs font-black text-gold">{c.name?.[0]}</span>
                  <div>
                    <p className="text-xs font-bold text-strong">{c.name}</p>
                    <p className="text-[9px] text-muted">{formatDate(c.createdAt)} — {c.productTitle}</p>
                  </div>
                </div>
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} className={i <= (c.rating || 5) ? 'fill-gold text-gold' : 'text-faint'} />)}
                </span>
              </div>
              <p className="mt-3 text-xs leading-6 text-soft">«{c.text}»</p>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                {c.status !== 'approved' && (
                  <button onClick={() => act(c._id, 'approve')} disabled={busy === c._id + 'approve'} className="flex items-center gap-1.5 rounded-lg bg-green-600/90 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-green-500">
                    {busy === c._id + 'approve' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} تأیید و انتشار
                  </button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => act(c._id, 'reject')} disabled={busy === c._id + 'reject'} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-soft transition hover:border-gold hover:text-gold"><X size={13} /> رد کردن</button>
                )}
                <button onClick={() => remove(c._id)} disabled={busy === c._id + 'delete'} className="mr-auto rounded-lg border border-line p-1.5 text-muted transition hover:border-red-500 hover:text-red-400" aria-label="حذف"><Trash2 size={14} /></button>
              </div>
            </article>
          ))
        )}
      </div>
      <Pagination total={comments?.length || 0} page={page} perPage={PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
