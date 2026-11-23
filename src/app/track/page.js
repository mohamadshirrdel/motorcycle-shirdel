'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, Search, CheckCircle2, Circle, Truck, CreditCard, PackageCheck, XCircle } from 'lucide-react';
import { ORDER_STATUS, formatPrice, formatDate } from '@/lib/format';

const STEPS = [
  { key: 'paid', label: 'پرداخت ثبت شد', icon: CreditCard },
  { key: 'processing', label: 'آماده‌سازی و نصب', icon: PackageSearch },
  { key: 'shipped', label: 'ارسال شد', icon: Truck },
  { key: 'delivered', label: 'تحویل داده شد', icon: PackageCheck },
];

function trackToIndex(status) {
  // ترتیب منطقی برای نمایش تایم‌لاین
  if (status === 'pending') return -1;
  if (status === 'paid') return 0;
  if (status === 'processing') return 1;
  if (status === 'shipped') return 2;
  if (status === 'delivered') return 3;
  return -1;
}

function TrackInner() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const track = async (e) => {
    e?.preventDefault();
    if (!code.trim() || !phone.trim()) return;
    setBusy(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders?code=${encodeURIComponent(code.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در پیگیری');
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const activeIdx = order ? trackToIndex(order.status) : -1;

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">پیگیری سفارش</p>
        <h1 className="mt-2 text-3xl font-black text-strong">سفارشم کجاست؟</h1>
        <p className="mt-1 text-sm text-muted">کد رهگیری (از پیامک یا صفحه ثبت سفارش) و شماره موبایلی که با آن خرید کردید را وارد کنید.</p>

        <form onSubmit={track} className="card mt-6 grid grid-cols-1 gap-3 p-6 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="label" htmlFor="t-code">کد رهگیری</label>
            <input id="t-code" dir="ltr" style={{ textAlign: 'right' }} className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SD-XXXXX" required />
          </div>
          <div>
            <label className="label" htmlFor="t-phone">شماره موبایل</label>
            <input id="t-phone" dir="ltr" style={{ textAlign: 'right' }} className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" inputMode="numeric" required />
          </div>
          <button type="submit" disabled={busy} className="btn-primary self-end">{busy ? 'در حال جستجو…' : <><Search size={18} /> پیگیری</>}</button>
        </form>

        {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

        {order && (
          <div className="card mt-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-[10px] font-bold text-muted">کد سفارش</p>
                <p dir="ltr" className="text-lg font-black tracking-[0.15em] text-gold">{order.code}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-muted">وضعیت</p>
                <span className={`chip mt-1 ${ORDER_STATUS[order.status]?.cls}`}>{ORDER_STATUS[order.status]?.label || order.status}</span>
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <p className="mt-5 flex items-center gap-2 text-sm font-bold text-red-400"><XCircle size={18} /> این سفارش لغو شده است. برای جزئیات با ۰۵۱-۵۲۲۸۱۲۳۴ تماس بگیرید.</p>
            ) : (
              <ol className="mt-6 space-y-0">
                {STEPS.map((step, i) => {
                  const done = activeIdx >= i;
                  const Icon = step.icon;
                  return (
                    <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < STEPS.length - 1 && <span className={`absolute right-[11px] top-6 h-full w-0.5 ${activeIdx > i ? 'bg-accent' : 'bg-line'}`} />}
                      <span className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${done ? 'border-accent bg-accent text-white' : 'border-line bg-panel2 text-muted'}`}>
                        {done ? <CheckCircle2 size={14} /> : <Circle size={10} />}
                      </span>
                      <div className="flex items-center gap-2">
                        <Icon size={15} className={done ? 'text-accentSoft' : 'text-muted'} />
                        <span className={`text-sm font-bold ${done ? 'text-strong' : 'text-muted'}`}>{step.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[10px] font-bold text-muted">اقلام سفارش — {formatDate(order.createdAt)}</p>
              <ul className="mt-2 divide-y divide-line text-sm">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-soft">{i.title} <span className="text-[10px] text-muted">×{i.qty?.toLocaleString('fa-IR')}</span></span>
                    <span className="font-bold text-strong">{formatPrice(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-muted">مبلغ کل</span>
                <span className="font-black text-strong">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="container-x pt-32 text-center text-muted">در حال بارگذاری…</div>}>
      <TrackInner />
    </Suspense>
  );
}
