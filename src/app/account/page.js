'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRound, Phone, Mail, LogOut, Loader2, PackageSearch, ShoppingBag, ChevronLeft, Crown } from 'lucide-react';
import { ORDER_STATUS, formatPrice, formatDate, formatNumber } from '@/lib/format';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace('/login?next=/account');
          return null;
        }
        return r.json();
      })
      .then((d) => d && setUser(d))
      .catch(() => setError('خطا در دریافت اطلاعات حساب'));

    fetch('/api/account/orders', { cache: 'no-store' })
      .then(async (r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (!user && !error) {
    return <div className="flex min-h-[70vh] items-center justify-center pt-20"><Loader2 size={30} className="animate-spin text-accent" /></div>;
  }

  return (
    <div className="container-x max-w-4xl pb-16 pt-28 lg:pt-32">
      {/* کارت پروفایل */}
      <section className="card flex flex-col items-center justify-between gap-6 p-6 sm:flex-row sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-right">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold/15 font-vazir text-3xl font-black text-gold">{user?.name?.[0]}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">حساب من</p>
            <h1 className="mt-1 text-2xl font-black text-strong">{user?.name}</h1>
            {user?.role === 'admin' && (
              <Link href="/admin" className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold text-gold transition hover:border-gold"><Crown size={11} /> ادمین فروشگاه — ورود به پنل ←</Link>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] text-muted sm:justify-start">
              {user?.phone && <span dir="ltr" className="flex items-center gap-1"><Phone size={12} />{user.phone}</span>}
              {user?.email && <span dir="ltr" className="flex items-center gap-1"><Mail size={12} />{user.email}</span>}
            </div>
          </div>
        </div>
        <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white">
          <LogOut size={17} /> خروج از حساب
        </button>
      </section>

      {/* سفارش‌های من */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-strong"><ShoppingBag size={19} className="text-accent" /> سفارش‌های من</h2>
          <Link href="/bikes" className="flex items-center gap-1 text-xs font-bold text-accent transition hover:underline">ادامه خرید <ChevronLeft size={13} /></Link>
        </div>

        <div className="mt-3 space-y-3">
          {orders === null ? (
            <div className="card flex min-h-[140px] items-center justify-center"><Loader2 size={26} className="animate-spin text-accent" /></div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <PackageSearch size={34} className="mx-auto text-muted" />
              <p className="mt-3 font-black text-strong">هنوز سفارشی ثبت نکرده‌اید</p>
              <p className="mt-1 text-xs text-muted">سفارش‌هایی که با این حساب (یا موبایل آن) ثبت شوند اینجا نمایش داده می‌شوند.</p>
              <Link href="/bikes" className="btn-primary mt-5">رفتن به کاتالوگ</Link>
            </div>
          ) : (
            orders.map((o) => {
              const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
              return (
                <Link key={o.id} href={`/track?code=${encodeURIComponent(o.code)}`} className="card flex flex-wrap items-center gap-4 p-4 transition hover:border-accent/40">
                  <div className="min-w-[110px]">
                    <p dir="ltr" style={{ textAlign: 'right' }} className="font-mono text-xs font-black text-gold">{o.code}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs text-body">{(o.items || []).map((i) => i.title).join(' + ')}</p>
                    <p className="mt-1 text-[10px] text-muted">{o.items?.length?.toLocaleString('fa-IR')} قلم کالا</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-strong">{formatPrice(o.total)}</p>
                    <span className={`chip mt-1 ${st.cls}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
