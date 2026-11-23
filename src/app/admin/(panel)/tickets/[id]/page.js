'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, Loader2, Headset, User, Lock, LockOpen } from 'lucide-react';
import { TICKET_STATUS, formatDate } from '@/lib/format';

export default function AdminTicketDetailPage({ params }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setTicket(data);
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ارسال');
      setReply('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('خطا در تغییر وضعیت');
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (error && !ticket) return <p className="text-sm text-red-400">{error}</p>;
  if (!ticket) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 size={30} className="animate-spin text-accent" /></div>;

  const st = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
  const messages = [
    { author: 'user', text: ticket.message, createdAt: ticket.createdAt },
    ...(ticket.replies || []),
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/tickets" className="flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-strong"><ArrowRight size={14} /> بازگشت به تیکت‌ها</Link>
        <div className="flex items-center gap-2">
          {ticket.status === 'closed' ? (
            <button onClick={() => setStatus('open')} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-bold text-body transition hover:border-green-500 hover:text-green-400"><LockOpen size={13} /> بازگشایی تیکت</button>
          ) : (
            <button onClick={() => setStatus('closed')} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-bold text-body transition hover:border-red-500 hover:text-red-400"><Lock size={13} /> بستن تیکت</button>
          )}
        </div>
      </div>

      {/* اطلاعات تیکت */}
      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p dir="ltr" style={{ textAlign: 'right' }} className="font-mono text-xs font-black text-gold">{ticket.code}</p>
            <h1 className="mt-1.5 text-lg font-black text-strong">{ticket.subject}</h1>
            <p className="mt-1 text-[11px] leading-6 text-muted">{ticket.name} — <a dir="ltr" className="inline-block hover:text-strong" href={`mailto:${ticket.email}`}>{ticket.email}</a><br />{formatDate(ticket.createdAt)}{ticket.orderCode ? ` — سفارش ${ticket.orderCode}` : ''}</p>
          </div>
          <span className={`chip ${st.cls}`}>{st.label}</span>
        </div>

        {/* ریسه پیام‌ها */}
        <div className="mt-5 space-y-4">
          {messages.map((m, i) => {
            const isAdmin = m.author === 'admin';
            return (
              <div key={i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAdmin ? 'bg-accent text-white' : 'bg-panel3 text-gold'}`}>
                  {isAdmin ? <Headset size={15} /> : <User size={15} />}
                </span>
                <div className={`max-w-[80%] rounded-2xl border px-4 py-3 ${isAdmin ? 'border-accent/30 bg-accent/5' : 'border-line bg-panel2'}`}>
                  <p className="text-[10px] font-bold text-muted">{isAdmin ? 'شما (پشتیبانی)' : ticket.name} — {formatDate(m.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-7 text-strong">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* پاسخ مدیر */}
        {ticket.status !== 'closed' ? (
          <form onSubmit={sendReply} className="mt-5 border-t border-line pt-4">
            <label className="label" htmlFor="admin-reply">پاسخ شما به مشتری</label>
            <div className="flex gap-2">
              <textarea id="admin-reply" className="input min-h-[52px]" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ پشتیبانی…" required maxLength={1500} />
              <button type="submit" disabled={busy} className="btn-primary shrink-0 !px-4" aria-label="ارسال پاسخ">{busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted">پس از ارسال، وضعیت تیکت خودکار «پاسخ داده شده» می‌شود و مشتری در صفحه پیگیری تیکت آن را می‌بیند.</p>
          </form>
        ) : (
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">این تیکت بسته شده است. برای ارسال پاسخ ابتدا آن را بازگشایی کنید.</p>
        )}
      </div>
    </div>
  );
}
