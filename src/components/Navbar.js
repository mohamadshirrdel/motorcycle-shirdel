'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Phone, Search, LayoutDashboard, User, LogOut, UserRound } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { href: '/', label: 'خانه' },
  { href: '/bikes', label: 'محصولات' },
  { href: '/track', label: 'پیگیری سفارش' },
  { href: '/tickets', label: 'پشتیبانی و تیکت' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس' },
];

// نشان تک‌حرفی برند: «ش» برای شیردل
export function BrandMark({ size = 44 }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accentSoft via-accent to-[#8f0300] shadow-glow"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="font-vazir font-black leading-none text-white"
        style={{ fontSize: size * 0.52, textShadow: '0 2px 6px rgba(0,0,0,.35)' }}
      >
        ش
      </span>
      <span
        className="absolute bottom-1.5 right-1.5 rounded-full bg-gold"
        style={{ width: size * 0.12, height: size * 0.12 }}
      />
    </span>
  );
}

export function Wordmark({ dark = true }) {
  return (
    <span className="leading-tight">
      <span className="hidden text-[9px] font-bold tracking-[0.35em] text-muted min-[420px]:block">MOTORCYCLES</span>
      <span className="block whitespace-nowrap text-lg font-black text-strong sm:text-xl">
        <span className="min-[420px]:hidden"><span className="text-accent">شیردل</span></span>
        <span className="hidden min-[420px]:inline">موتورسیکلت <span className="text-accent">شیردل</span></span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => setUser(null))
      .finally(() => setUserLoaded(true));
  }, [pathname]);

  if (pathname?.startsWith('/admin') || pathname === '/login') return null;

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-ink/85 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      {/* نوار بالایی */}
      <div className="hidden border-b border-line/60 bg-panel/60 md:block">
        <div className="container-x flex h-9 items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone size={11} className="text-accent" /> ۰۵۱-۵۲۲۸۱۲۳۴</span>
            <span>خراسان رضوی، تربت جام، خیابان امام خمینی، روبه‌روی بازارچهٔ امام، پلاک ۱۲۰۰</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ش → پ: ۹ تا ۲۰</span>
            <Link href="/admin/login" className="flex items-center gap-1 transition hover:text-strong"><LayoutDashboard size={11} /> پنل مدیریت</Link>
          </div>
        </div>
      </div>

      <div className="container-x flex h-16 items-center justify-between gap-3 lg:h-[72px]">
        {/* لوگو */}
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="موتورسیکلت شیردل — خانه">
          <BrandMark size={44} />
          <Wordmark />
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-bold transition xl:px-4 ${
                  active ? 'bg-panel2 text-strong' : 'text-soft hover:bg-panel2 hover:text-strong'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="!p-2.5" />
          <Link href="/bikes" aria-label="جستجو" className="hidden rounded-xl border border-line bg-panel2 p-2.5 text-soft transition hover:border-accent hover:text-strong sm:block">
            <Search size={18} />
          </Link>

          {/* حساب کاربری */}
          {userLoaded && user ? (
            <>
              <Link href="/account" title={user.name} className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 py-2 pl-3 pr-2 text-xs font-bold text-gold transition hover:border-gold">
                <UserRound size={16} />
                <span className="hidden max-w-[90px] truncate sm:inline">{user.name}</span>
              </Link>
              <button onClick={logout} title="خروج از حساب" aria-label="خروج از حساب" className="rounded-xl border border-line bg-panel2 p-2.5 text-soft transition hover:border-red-500 hover:text-red-500">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3 py-2.5 text-xs font-bold text-strong transition hover:border-accent sm:px-4">
              <User size={16} /> <span className="hidden sm:inline">ورود / ثبت‌نام</span>
            </Link>
          )}

          <Link href="/cart" aria-label="سبد خرید" className="relative rounded-xl border border-line bg-panel2 p-2.5 text-soft transition hover:border-accent hover:text-strong">
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-black text-white">
                {count.toLocaleString('fa-IR')}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen((v) => !v)} aria-label="منو" className="rounded-xl border border-line bg-panel2 p-2.5 text-soft lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-xl lg:hidden">
          <div className="container-x grid grid-cols-1 gap-1 py-4">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl px-4 py-3 font-bold text-body hover:bg-panel2">
                {item.label}
              </Link>
            ))}
            <Link href="/account" className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-body hover:bg-panel2"><UserRound size={16} /> حساب من</Link>
            <Link href="/admin/login" className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-gold hover:bg-panel2"><LayoutDashboard size={16} /> پنل مدیریت</Link>
          </div>
        </div>
      )}
    </header>
  );
}
