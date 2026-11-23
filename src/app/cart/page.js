'use client';

import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, setQty, removeItem, clearCart, total, hydrated } = useCart();

  if (!hydrated) {
    return <div className="container-x pb-20 pt-32 text-center text-muted">در حال بارگذاری سبد…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-4 pb-20 pt-32 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-panel2 text-accent"><ShoppingCart size={36} /></span>
        <h1 className="text-2xl font-black text-strong">سبد خرید خالی است</h1>
        <p className="max-w-sm text-sm leading-7 text-muted">هنوز چیزی انتخاب نکرده‌اید؛ سری به کاتالوگ بزنید، احتمالاً یکی از آن‌ها را عاشق می‌شوید.</p>
        <Link href="/bikes" className="btn-primary mt-2">مشاهده محصولات <ArrowLeft size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <h1 className="flex items-center gap-3 text-2xl font-black text-strong"><ShoppingBag className="text-accent" /> سبد خرید شما</h1>
      <p className="mt-1 text-sm text-muted">{items.length.toLocaleString('fa-IR')} کالا در سبد</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* آیتم‌ها */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.slug} className="card flex gap-4 p-4">
              <Link href={`/bikes/${item.slug}`} className="h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-stage sm:h-32 sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="h-full w-full object-contain p-2" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/bikes/${item.slug}`} className="line-clamp-2 font-bold text-strong hover:text-strong">{item.title}</Link>
                  <button onClick={() => removeItem(item.slug)} className="rounded-lg p-2 text-muted transition hover:bg-panel2 hover:text-red-400" aria-label="حذف"><Trash2 size={17} /></button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-lg border border-line bg-panel2">
                    <button onClick={() => setQty(item.slug, item.qty - 1)} className="p-2 text-muted hover:text-strong"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-black text-strong">{item.qty.toLocaleString('fa-IR')}</span>
                    <button onClick={() => setQty(item.slug, item.qty + 1)} disabled={item.stock != null && item.qty >= item.stock} className="p-2 text-muted transition hover:text-strong disabled:cursor-not-allowed disabled:opacity-30" aria-label="افزایش تعداد"><Plus size={14} /></button>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-strong">{formatPrice(item.price * item.qty)}</p>
                    {item.stock != null && item.qty >= item.stock && (
                      <p className="mt-1 text-[10px] font-bold text-amber-500">حداکثر موجودی شوروم: {item.stock.toLocaleString('fa-IR')} دستگاه</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-xs font-bold text-muted transition hover:text-red-400">پاک‌کردن کل سبد ×</button>
        </div>

        {/* خلاصه سفارش */}
        <aside className="card h-fit p-6">
          <h2 className="font-black text-strong">خلاصه سفارش</h2>
          <dl className="mt-4 space-y-2.5 text-sm text-soft">
            <div className="flex justify-between"><dt>جمع کالاها</dt><dd>{formatPrice(total)}</dd></div>
            <div className="flex justify-between"><dt>هزینه ارسال و نصب</dt><dd className="font-bold text-green-400">رایگان</dd></div>
            <div className="flex justify-between"><dt>بیمه بدنه سال اول</dt><dd className="font-bold text-green-400">رایگان</dd></div>
          </dl>
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-muted">مبلغ قابل پرداخت</span>
              <span className="text-xl font-black text-strong">{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary mt-5 w-full justify-center text-base">ادامه و ثبت سفارش <ArrowLeft size={18} /></Link>
          <Link href="/bikes" className="mt-2 block text-center text-xs font-bold text-muted transition hover:text-strong">بازگشت به فروشگاه</Link>
        </aside>
      </div>
    </div>
  );
}
