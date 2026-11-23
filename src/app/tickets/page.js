'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Send, Search, Headset } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', subject: '', orderCode: '', message: '' });
  const [lookup, setLookup] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت تیکت');
      router.push(`/tickets/${encodeURIComponent(data.code)}`);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
      setBusy(false);
    }
  };

  const goLookup = (e) => {
    e.preventDefault();
    const code = lookup.trim().toUpperCase();
    if (code) router.push(`/tickets/${encodeURIComponent(code)}`);
  };

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent"><Headset size={30} /></span>
        <h1 className="mt-5 text-3xl font-black text-strong">پشتیبانی موتورسیکلت شیردل</h1>
        <p className="mt-2 text-sm leading-7 text-muted">سؤال فنی، هماهنگی سرویس، گارانتی یا هر چیز دیگر — تیکت بزنید؛ میانگین زمان پاسخ ما کمتر از ۲ ساعت کاری است.</p>
      </div>

      <div className="mx-auto mt-8 grid grid-cols-1 max-w-5xl gap-6 lg:grid-cols-5">
        {/* فرم تیکت جدید */}
        <form onSubmit={submit} className="card space-y-4 p-6 lg:col-span-3">
          <h2 className="flex items-center gap-2 font-black text-strong"><Ticket size={18} className="text-accent" /> ثبت تیکت جدید</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="n">نام و نام‌خانوادگی *</label>
              <input id="n" className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label" htmlFor="e">ایمیل *</label>
              <input id="e" type="email" dir="ltr" style={{ textAlign: 'right' }} className="input" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s">موضوع *</label>
              <input id="s" className="input" value={form.subject} onChange={set('subject')} required placeholder="مثلاً: هماهنگی سرویس اولیه" />
            </div>
            <div>
              <label className="label" htmlFor="o">کد سفارش (اختیاری)</label>
              <input id="o" dir="ltr" style={{ textAlign: 'right' }} className="input" value={form.orderCode} onChange={set('orderCode')} placeholder="SD-XXXXX" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="m">شرح درخواست *</label>
            <textarea id="m" className="input min-h-[130px]" value={form.message} onChange={set('message')} required placeholder="جزئیات را کامل بنویسید تا سریع‌تر پاسخ بگیریم…" />
          </div>
          {msg && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">{msg.text}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">{busy ? 'در حال ثبت…' : <><Send size={16} /> ارسال تیکت</>}</button>
        </form>

        {/* پیگیری تیکت قبلی */}
        <div className="space-y-4 lg:col-span-2">
          <form onSubmit={goLookup} className="card p-6">
            <h2 className="flex items-center gap-2 font-black text-strong"><Search size={18} className="text-gold" /> پیگیری تیکت قبلی</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">کد تیکتی که بعد از ثبت به شما نمایش داده شد را وارد کنید.</p>
            <label className="label mt-4" htmlFor="lookup">کد تیکت</label>
            <input id="lookup" dir="ltr" style={{ textAlign: 'right' }} className="input tracking-widest" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="T-XXXXX" required />
            <button type="submit" className="btn-ghost mt-3 w-full justify-center">مشاهده تیکت</button>
          </form>

          <div className="card p-6 text-xs leading-7 text-muted">
            <p className="font-black text-body">ساعت پاسخگویی</p>
            <p className="mt-1">شنبه تا پنجشنبه، ۹ تا ۲۰<br />جمعه‌ها ۱۰ تا ۱۷</p>
            <p className="mt-3 font-black text-body">راه‌های دیگر</p>
            <p className="mt-1">تلفن: ۰۵۱-۵۲۲۸۱۲۳۴<br />ایمیل: support@shirdelmotor.ir</p>
          </div>
        </div>
      </div>
    </div>
  );
}
