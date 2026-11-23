'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star, ShoppingCart, Check, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, discountPercent, effectivePrice, categoryLabel } from '@/lib/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product);
  const price = effectivePrice(product);
  const inStock = (product.stock ?? 0) > 0;

  const onAdd = () => {
    if (!inStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
      <Link href={`/bikes/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] || '/images/hero.jpg'}
          alt={product.title}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-lg bg-accent px-2 py-1 text-[11px] font-black text-white">
            ٪{discount.toLocaleString('fa-IR')} تخفیف
          </span>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/25 bg-black/65 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">{categoryLabel(product.category)}</span>
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-black text-white">ناموجود</span>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-gold">{product.brand}</span>
          <span className="flex items-center gap-1 text-[11px] text-muted"><Star size={11} className="fill-gold text-gold" /> {product.ratingAvg?.toLocaleString('fa-IR')} ({product.ratingCount?.toLocaleString('fa-IR')})</span>
        </div>
        <Link href={`/bikes/${product.slug}`} className="mt-1.5 line-clamp-1 block font-black text-strong transition hover:text-strong">
          {product.title}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{product.engine} • {product.power}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {discount > 0 && (
              <p className="text-[11px] text-muted line-through">{formatPrice(product.price)}</p>
            )}
            <p className="text-sm font-black text-strong">{formatPrice(price)}</p>
          </div>
          <button
            onClick={onAdd}
            disabled={!inStock}
            aria-label="افزودن به سبد"
            className={`rounded-xl p-2.5 transition ${
              added ? 'bg-green-600 text-white' : 'bg-accent text-white hover:bg-accentSoft'
            } disabled:cursor-not-allowed disabled:bg-panel3 disabled:text-muted`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
