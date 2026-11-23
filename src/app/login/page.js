'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ShieldCheck, Truck, BadgePercent, Phone, Mail, User, Lock, UserRound, Bike } from 'lucide-react';
import { BrandMark } from '@/components/Navbar';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';

  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const submitLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ورود');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت‌نام');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const inputIcon = (Icon) => (Icon ? <Icon size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" /> : null);

  return (
    <div className="grid grid-cols-1 min-h-screen lg:grid-cols-2">
      {/* پنل برند — فقط دسکتاپ */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image src="/images/hero.jpg" alt="موتورسیکلت شیردل" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/55 to-black/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark size={52} />
            <span className="leading-tight">
              <span className="block text-[10px] font-bold tracking-[0.35em] text-white/60">MOTORCYCLES</span>
              <span className="block text-2xl font-black text-white">موتورسیکلت <span className="text-accentSoft">شیردل</span></span>
            </span>
          </Link>
          <div className="max-w-md">
            <h2 className="hero-light-text text-4xl font-black leading-snug">قدرت را<br />لمس کن.</h2>
            <p className="hero-light-soft mt-3 leading-7">با حساب شیردل، سفارش‌هایت را یک‌جا ببین، سریع‌تر تسویه کن و از وضعیت تحویل باخبر شو.</p>
            <ul className="mt-8 space-y-3 text-sm text-white/85">
              <li className="flex items-center gap-2"><ShieldCheck size={17} className="text-gold" /> گارانتی اصالت برای همه مدل‌ها</li>
              <li className="flex items-center gap-2"><Truck size={17} className="text-gold" /> تحویل و نصب رایگان در تربت جام و سراسر خراسان رضوی</li>
              <li className="flex items-center gap-2"><BadgePercent size={17} className="text-gold" /> اقساط ویژه تا ۳۶ ماه</li>
            </ul>
          </div>
          <p className="text-[10px] tracking-widest text-white/40">SHIRDEL MOTORCYCLES © 2026</p>
        </div>
      </aside>

      {/* فرم */}
      <main className="flex items-center justify-center bg-ink p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* لوگو برای موبایل */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <BrandMark size={48} />
            <span className="text-xl font-black text-strong">موتورسیکلت <span className="text-accent">شیردل</span></span>
          </Link>

          {/* تب‌ها */}
          <div className="grid grid-cols-2 rounded-2xl border border-line bg-panel2 p-1.5">
            {[
              ['login', 'ورود به حساب'],
              ['register', 'ثبت‌نام'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(''); }}
                className={`rounded-xl py-2.5 text-sm font-black transition ${mode === key ? 'bg-accent text-white shadow-glow' : 'text-soft hover:text-strong'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* فرم ورود */}
          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="identifier">شماره موبایل یا ایمیل</label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="identifier" className="input pr-11" dir="ltr" style={{ textAlign: 'right' }} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="09123456789 یا you@example.com" autoComplete="username" inputMode="email" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="lp">رمز عبور</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="lp" type="password" className="input pr-11" dir="ltr" style={{ textAlign: 'right' }} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" autoComplete="current-password" />
                </div>
              </div>
              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center text-base">{busy ? <Loader2 size={18} className="animate-spin" /> : 'ورود'}</button>
              <p className="text-center text-xs text-muted">حساب ندارید؟ <button type="button" onClick={() => setMode('register')} className="font-bold text-accent transition hover:underline">ثبت‌نام کنید</button></p>
            </form>
          ) : (
            /* فرم ثبت‌نام */
            <form onSubmit={submitRegister} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="name">نام و نام‌خانوادگی *</label>
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="name" className="input pr-11" value={name} onChange={(e) => setName(e.target.value)} required placeholder="آریا محمدی" autoComplete="name" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="phone">شماره موبایل</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input id="phone" dir="ltr" inputMode="numeric" style={{ textAlign: 'right' }} className="input pr-11" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" autoComplete="tel" />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="email">ایمیل</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input id="email" type="email" dir="ltr" style={{ textAlign: 'right' }} className="input pr-11" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </div>
              </div>
              <p className="-mt-2 text-[10px] text-muted">حداقل یکی از موبایل یا ایمیل الزامی است.</p>
              <div>
                <label className="label" htmlFor="rp">رمز عبور (حداقل ۶ کاراکتر) *</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="rp" type="password" dir="ltr" style={{ textAlign: 'right' }} className="input pr-11" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} placeholder="••••••••" autoComplete="new-password" />
                </div>
              </div>
              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center text-base">{busy ? <Loader2 size={18} className="animate-spin" /> : <><User size={18} /> ساخت حساب</>}</button>
              <p className="text-center text-xs text-muted">حساب دارید؟ <button type="button" onClick={() => setMode('login')} className="font-bold text-accent transition hover:underline">وارد شوید</button></p>
            </form>
          )}

          <p className="mt-6 text-center text-[10px] leading-5 text-muted">با ورود یا ثبت‌نام، قوانین و مقررات موتورسیکلت شیردل را می‌پذیرید.<br /><Link href="/" className="hover:text-strong">← بازگشت به سایت</Link></p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink"><Loader2 className="animate-spin text-accent" size={32} /></div>}>
      <LoginInner />
    </Suspense>
  );
}
