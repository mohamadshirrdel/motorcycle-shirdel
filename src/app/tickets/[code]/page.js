'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, ShieldCheck, User, Headset, Loader2 } from 'lucide-react';
import { TICKET_STATUS, formatDate } from '@/lib/format';

export default function TicketThreadPage({ params }) {
  const { code: rawCode } = use(params);
  const code = decodeURIComponent(rawCode || '').toUpperCase();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets?code=${encodeURIComponent(code)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در دریافت تیکت');
      setTicket(data);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [code]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // رفرش خودکار پاسخ‌ها
    return () => clearInterval(t);
  }, [load]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, text: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ارسال پاسخ');
      setReply('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !ticket) {
    return (
      <div className="container-x pb-20 pt-32 text-center">
        <p className="text-lg font-black text-strong">تیکت یافت نشد</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link href="/tickets" className="btn-primary mt-6 inline-flex">بازگشت به پشتیبانی</Link>
      </div>
    );
  }

  if (!ticket) {
    return <div className="container-x flex min-h-[60vh] items-center justify-center pt-28 text-muted"><Loader2 className="animate-spin" size={28} /></div>;
  }

  const st = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
  const messages = [
    { author: 'user', text: ticket.message, createdAt: ticket.createdAt },
    ...(ticket.replies || []),
  ];

  return (
    <div className="container-x max-w-4xl pb-16 pt-28 lg:pt-32">
      <Link href="/tickets" className="flex w-fit items-center gap-1.5 text-xs font-bold text-muted transition hover:text-strong"><ArrowRight size={14} /> بازگشت به پشتیبانی</Link>

      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p dir="ltr" className="text-xs font-black tracking-[0.2em] text-gold">{ticket.code}</p>
            <h1 className="mt-1.5 text-xl font-black text-strong">{ticket.subject}</h1>
            <p className="mt-1 text-[11px] text-muted">{ticket.name} — {formatDate(ticket.createdAt)}{ticket.orderCode ? ` — سفارش ${ticket.orderCode}` : ''}</p>
          </div>
          <span className={`chip ${st.cls}`}>{st.label}</span>
        </div>

        {/* ریسه پیام‌ها */}
        <div className="mt-5 space-y-4">
          {messages.map((m, i) => {
            const isAdmin = m.author === 'admin';
            return (
              <div key={i} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAdmin ? 'bg-accent text-white' : 'bg-panel3 text-gold'}`}>
                  {isAdmin ? <Headset size={16} /> : <User size={16} />}
                </span>
                <div className={`max-w-[75%] rounded-2xl border px-4 py-3 ${isAdmin ? 'border-accent/30 bg-accent/5' : 'border-line bg-panel2'}`}>
                  <p className="text-[10px] font-bold text-muted">{isAdmin ? 'پشتیبانی موتورسیکلت شیردل' : 'شما'} — {formatDate(m.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-7 text-strong">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* پاسخ کاربر */}
        {ticket.status !== 'closed' ? (
          <form onSubmit={sendReply} className="mt-5 border-t border-line pt-4">
            <label className="label" htmlFor="r">پاسخ شما</label>
            <div className="flex gap-2">
              <input id="r" className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ خود را بنویسید…" maxLength={1500} required />
              <button type="submit" disabled={busy} className="btn-primary shrink-0 !px-4" aria-label="ارسال پاسخ">{busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
            </div>
          </form>
        ) : (
          <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted"><ShieldCheck size={14} /> این تیکت بسته شده است. برای درخواست جدید تیکت تازه‌ای ثبت کنید.</p>
        )}
      </div>
    </div>
  );
}
