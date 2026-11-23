'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bike, LayoutDashboard, Package, ShoppingCart, MessageSquare, LifeBuoy,
  LogOut, Store, Menu, X, Users,
} from 'lucide-react';

const LINKS = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'محصولات', icon: Package },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: ShoppingCart, badgeKey: 'pendingOrders' },
  { href: '/admin/comments', label: 'کامنت‌ها', icon: MessageSquare, badgeKey: 'pendingComments' },
  { href: '/admin/tickets', label: 'تیکت‌ها', icon: LifeBuoy, badgeKey: 'openTickets' },
  { href: '/admin/users', label: 'کاربران', icon: Users },
];

export default function AdminShell({ name, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({});

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBadges({ pendingOrders: d.pendingOrders, pendingComments: d.pendingComments, openTickets: d.openTickets }))
      .catch(() => {});
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  const isActive = (l) => (l.exact ? pathname === l.href : pathname?.startsWith(l.href));

  const sidebar = (
    <aside className="flex h-full w-[272px] max-w-[86vw] flex-col border-l border-line bg-panel">
      {/* لوگو */}
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent"><Bike size={20} className="text-strong" /></span>
        <span className="leading-tight">
          <span className="block text-sm font-black text-strong">پنل مدیریت موتورسیکلت شیردل</span>
          <span className="block text-[9px] tracking-widest text-muted">SHIRDEL MOTORCYCLES CONSOLE</span>
        </span>
      </div>

      {/* منو */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-1.5 pt-2 text-[9px] font-black uppercase tracking-widest text-muted">مدیریت فروشگاه</p>
        {LINKS.map((l) => {
          const active = isActive(l);
          const badge = l.badgeKey ? badges[l.badgeKey] : 0;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? 'bg-accent text-white shadow-glow' : 'text-soft hover:bg-panel2 hover:text-strong'}`}
            >
              <span className="flex items-center gap-2.5"><l.icon size={17} />{l.label}</span>
              {badge > 0 && <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-white/20' : 'bg-accent/15 text-accentSoft'}`}>{badge.toLocaleString('fa-IR')}</span>}
            </Link>
          );
        })}

        <p className="px-3 pb-1.5 pt-5 text-[9px] font-black uppercase tracking-widest text-muted">دسترسی سریع</p>
        <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-soft transition hover:bg-panel2 hover:text-strong"><Store size={17} /> مشاهده سایت <span className="text-[9px] text-muted">(تب جدید)</span></Link>
      </nav>

      {/* کاربر + خروج */}
      <div className="border-t border-line p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-panel2 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-black text-gold">{name?.[0] || 'آ'}</span>
            <span className="min-w-0"><span className="block truncate text-xs font-bold text-strong">{name || 'مدیر فروشگاه'}</span><span className="block text-[9px] text-muted">ادمین ارشد</span></span>
          </div>
          <button onClick={logout} title="خروج از پنل" aria-label="خروج" className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-400"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* سایدبار دسکتاپ */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebar}</div>

      {/* هدر موبایل + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-xl lg:hidden">
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-black text-strong"><Bike size={17} className="shrink-0 text-accent" /> <span className="truncate">پنل مدیریت موتورسیکلت شیردل</span></span>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-line p-2 text-soft" aria-label="باز/بستن منو">{open ? <X size={18} /> : <Menu size={18} />}</button>
        </header>
        {open && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 right-0">{sidebar}</div>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
