'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, PackageSearch, Phone } from 'lucide-react';

function SuccessInner() {
  const params = useSearchParams();
  const code = params.get('code') || '';

  return (
    <div className="container-x flex min-h-[75vh] flex-col items-center justify-center pb-20 pt-28 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
        <CheckCircle2 size={44} className="text-green-400" />
      </span>
      <h1 className="mt-6 text-3xl font-black text-strong">سفارش شما ثبت شد! 🏍</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted">در چند دقیقه آینده همکاران ما برای هماهنگی تحویل با شما تماس می‌گیرند. کد رهگیری را برای پیگیری سفارش نزد خود نگه دارید:</p>
      {code && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 px-8 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">کد رهگیری سفارش</p>
          <p dir="ltr" className="mt-1 text-2xl font-black tracking-[0.2em] text-gold">{code}</p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href={`/track?code=${encodeURIComponent(code)}`} className="btn-primary"><PackageSearch size={18} /> پیگیری سفارش</Link>
        <a href="tel:05152281234" className="btn-ghost"><Phone size={18} /> ۰۵۱-۵۲۲۸۱۲۳۴</a>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-x pt-32 text-center text-muted">در حال بارگذاری…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
