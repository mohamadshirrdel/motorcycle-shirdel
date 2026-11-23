'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, Loader2, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ورود');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* پس‌زمینه تزئینی */}
      <div className="pointer-events-none absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-1/4 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accentSoft via-accent to-[#8f0300] font-vazir text-3xl font-black text-white shadow-glow">ش</span>
          <span className="text-2xl font-black text-strong">موتورسیکلت <span className="text-accent">شیردل</span></span>
        </Link>

        <form onSubmit={submit} className="card p-8">
          <h1 className="text-center text-xl font-black text-strong">ورود به پنل مدیریت</h1>
          <p className="mt-1 text-center text-[11px] text-muted">ویژه مدیر و تیم فروش موتورسیکلت شیردل</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="u">نام کاربری، موبایل یا ایمیل ادمین</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="u" className="input pr-11" dir="ltr" autoComplete="username" style={{ textAlign: 'left' }} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus placeholder="mohammad یا موبایل/ایمیل" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="p">رمز عبور</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="p" type="password" className="input pr-11" dir="ltr" autoComplete="current-password" style={{ textAlign: 'left' }} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-400">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full justify-center text-base">
              {busy ? <Loader2 size={18} className="animate-spin" /> : 'ورود به پنل'}
            </button>
          </div>
          <p className="mt-6 text-center text-[10px] text-muted">پس از ورود به همه بخش‌ها دسترسی دارید — مراقب رمز خود باشید.</p>
        </form>
        <p className="mt-6 text-center"><Link href="/" className="text-xs font-bold text-muted transition hover:text-strong">← بازگشت به سایت</Link></p>
      </div>
    </div>
  );
}
