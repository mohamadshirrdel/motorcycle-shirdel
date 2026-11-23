'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Banknote, ShoppingCart, Package, MessageSquareWarning, LifeBuoy,
  Loader2, ArrowLeft, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { ORDER_STATUS, formatPrice, formatNumber, formatDate } from '@/lib/format';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'خطا در دریافت آمار');
        setStats(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>;
  if (!stats) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 size={32} className="animate-spin text-accent" /></div>;

  const maxDay = Math.max(1, ...stats.days.map((d) => d.count));

  const KPIS = [
    { icon: Banknote, label: 'درآمد محقق‌شده', value: formatPrice(stats.revenue), sub: 'سفارش‌های پرداخت‌شده تا امروز', cls: 'from-green-500/20 to-transparent text-green-400' },
    { icon: ShoppingCart, label: 'کل سفارش‌ها', value: formatNumber(stats.ordersCount), sub: `${formatNumber(stats.pendingOrders)} سفارش در صف پردازش`, cls: 'from-blue-500/20 to-transparent text-blue-400' },
    { icon: Package, label: 'مدل‌های فعال', value: formatNumber(stats.productsCount), sub: `${formatNumber(stats.outOfStock)} مدل ناموجود`, cls: 'from-gold/20 to-transparent text-gold' },
    { icon: MessageSquareWarning, label: 'کامنت‌های در انتظار', value: formatNumber(stats.pendingComments), sub: `${formatNumber(stats.approvedComments)} کامنت تأیید شده`, cls: 'from-purple-500/20 to-transparent text-purple-400' },
    { icon: LifeBuoy, label: 'تیکت‌های باز', value: formatNumber(stats.openTickets), sub: 'نیازمند پاسخ پشتیبانی', cls: 'from-accent/20 to-transparent text-accentSoft' },
  ];

  return (
    <div>
      {/* سربرگ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">داشبورد</p>
          <h1 className="mt-1.5 text-2xl font-black text-strong">سلام رئیس 👋</h1>
          <p className="mt-1 text-xs text-muted">{formatDate(new Date())} — خلاصه‌ی وضعیت امروز فروشگاه</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary !py-2.5 text-sm">+ افزودن محصول جدید</Link>
      </div>

      {/* کارت‌های KPI */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {KPIS.map(({ icon: Icon, label, value, sub, cls }) => (
          <div key={label} className={`rounded-2xl border border-line bg-gradient-to-b ${cls} p-4`}>
            <Icon size={20} />
            <p className="mt-3 text-[10px] font-bold text-muted">{label}</p>
            <p className="mt-1 truncate text-base font-black text-strong" title={value}>{value}</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* نمودار ۷ روز اخیر */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-black text-strong"><TrendingUp size={18} className="text-accent" /> سفارش‌های ۷ روز اخیر</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-muted hover:text-strong">همه سفارش‌ها <ArrowLeft size={13} /></Link>
          </div>
          <div className="mt-6 flex h-44 items-end justify-between gap-2">
            {stats.days.map((d) => (
              <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] font-bold text-soft">{d.count > 0 ? formatNumber(d.count) : ''}</span>
                <div
                  className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-t from-accent to-accentSoft transition-all duration-500"
                  style={{ height: `${8 + (d.count / maxDay) * 72}%` }}
                  title={formatPrice(d.total)}
                />
                <span className="text-[10px] text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* موجودی کم */}
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-black text-strong"><AlertTriangle size={18} className="text-gold" /> موجودی بحرانی</h2>
          <ul className="mt-4 divide-y divide-line">
            {stats.lowStock.length === 0 && <li className="py-4 text-center text-xs text-muted">موجودی همه مدل‌ها کافی است ✓</li>}
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                <Link href={`/admin/products`} className="line-clamp-1 text-soft hover:text-strong">{p.title}</Link>
                <span className={`shrink-0 rounded-md px-2 py-0.5 font-black ${p.stock === 0 ? 'bg-red-500/15 text-red-400' : 'bg-gold/10 text-gold'}`}>{p.stock === 0 ? 'ناموجود' : `${formatNumber(p.stock)} دستگاه`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* آخرین سفارش‌ها */}
      <div className="card mt-6 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-black text-strong">آخرین سفارش‌ها</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-muted hover:text-strong">مدیریت همه <ArrowLeft size={13} /></Link>
        </div>
        <table className="w-full min-w-[720px]">
          <thead className="bg-panel2/50">
            <tr><th className="th">کد</th><th className="th">مشتری</th><th className="th">تاریخ</th><th className="th">مبلغ</th><th className="th">وضعیت</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="transition hover:bg-panel2/40">
                <td className="td" dir="ltr" style={{ textAlign: 'right' }}><span className="font-mono text-xs font-bold text-gold">{o.code}</span></td>
                <td className="td text-body">{o.customer}<span className="block text-[10px] text-muted" dir="ltr" style={{ textAlign: 'right' }}>{o.phone}</span></td>
                <td className="td text-[11px] text-muted">{formatDate(o.createdAt)}</td>
                <td className="td font-bold text-strong">{formatPrice(o.total)}</td>
                <td className="td"><span className={`chip ${ORDER_STATUS[o.status]?.cls}`}>{ORDER_STATUS[o.status]?.label}</span></td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && <tr><td colSpan={5} className="td py-8 text-center text-muted">هنوز سفارشی ثبت نشده است.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
