'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Zap, Check, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, discountPercent, effectivePrice } from '@/lib/format';

export default function BuyPanel({ product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const maxQty = Math.max(0, product.stock ?? 0);
  const inStock = maxQty > 0;
  const price = effectivePrice(product);
  const discount = discountPercent(product);

  const onAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const onBuyNow = () => {
    addItem(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="card p-5">
      {/* قیمت */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          {discount > 0 && <p className="text-xs text-muted line-through">{formatPrice(product.price)}</p>}
          <p className="min-w-0 text-xl font-black leading-8 text-strong sm:text-2xl">{formatPrice(price)}</p>
          <p className="mt-0.5 text-[10px] text-muted">قیمت قطعی با فاکتور رسمی و نصب رایگان</p>
        </div>
        {discount > 0 && (
          <span className="rounded-xl bg-accent px-3 py-1.5 text-sm font-black text-white">٪{discount.toLocaleString('fa-IR')}-</span>
        )}
      </div>

      {/* موجودی */}
      <div className="flex items-center justify-between py-3 text-xs">
        <span className={inStock ? 'flex items-center gap-1.5 font-bold text-green-400' : 'flex items-center gap-1.5 font-bold text-red-400'}>
          <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
          {inStock ? `موجود در شوروم (${product.stock.toLocaleString('fa-IR')} دستگاه)` : 'موقتاً ناموجود'}
        </span>
        <span className="flex items-center gap-1 text-muted"><ShieldCheck size={13} className="text-gold" /> گارانتی اصالت</span>
      </div>

      {/* تعداد + دکمه‌ها */}
      <div className="flex items-stretch gap-2">
        <div className="flex items-center rounded-xl border border-line bg-panel2">
          <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="p-3 text-muted hover:text-strong" aria-label="کم"><Minus size={16} /></button>
          <span className="w-10 text-center font-black text-strong">{qty.toLocaleString('fa-IR')}</span>
          <button onClick={() => setQty((v) => Math.min(maxQty, v + 1))} disabled={qty >= maxQty} className="p-3 text-muted transition hover:text-strong disabled:cursor-not-allowed disabled:opacity-30" aria-label="زیاد"><Plus size={16} /></button>
        </div>
        <button onClick={onAdd} disabled={!inStock} className="btn-ghost flex-1 justify-center">
          {added ? <Check size={18} className="text-green-400" /> : <ShoppingCart size={18} />}
          {added ? 'افزوده شد' : 'افزودن به سبد'}
        </button>
      </div>
      <button onClick={onBuyNow} disabled={!inStock} className="btn-primary mt-2 w-full justify-center text-base">
        <Zap size={18} /> خرید فوری
      </button>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 p-3 text-[11px] leading-5 text-gold">
        <Truck size={16} className="shrink-0" /> تحویل فوری در سراسر خراسان رضوی + نصب، سند رسمی و یک‌سال سرویس دوره‌ای رایگان
      </div>
    </div>
  );
}
