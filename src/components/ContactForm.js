'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject: 'پیام از فرم تماس', orderCode: '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ارسال پیام');
      setDone(data.code);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center lg:col-span-3">
        <CheckCircle2 size={44} className="text-green-400" />
        <h2 className="text-xl font-black text-strong">پیام شما رسید ✓</h2>
        <p className="text-sm text-muted">کد پیگیری: <span dir="ltr" className="font-black text-gold">{done}</span></p>
        <p className="text-xs text-muted">می‌توانید از صفحه «پشتیبانی و تیکت» پاسخ ما را ببینید.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 lg:col-span-3">
      <h2 className="font-black text-strong">پیام بگذارید</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="cn">نام *</label><input id="cn" className="input" value={form.name} onChange={set('name')} required /></div>
        <div><label className="label" htmlFor="ce">ایمیل *</label><input id="ce" type="email" dir="ltr" style={{ textAlign: 'right' }} className="input" value={form.email} onChange={set('email')} required placeholder="you@example.com" /></div>
      </div>
      <div><label className="label" htmlFor="cm">متن پیام *</label><textarea id="cm" className="input min-h-[150px]" value={form.message} onChange={set('message')} required /></div>
      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? 'در حال ارسال…' : <><Send size={16} /> ارسال پیام</>}</button>
    </form>
  );
}
