'use client';

import { use, useEffect, useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'خطا در دریافت محصول');
        setProduct(d);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/admin/products" className="hover:text-strong">محصولات</Link>
        <ChevronLeft size={12} />
        <span className="text-soft">ویرایش محصول</span>
      </nav>
      <h1 className="mt-3 text-2xl font-black text-strong">ویرایش محصول</h1>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!product && !error && <div className="flex min-h-[300px] items-center justify-center"><Loader2 size={30} className="animate-spin text-accent" /></div>}
      {product && <div className="mt-6"><ProductForm initial={product} /></div>}
    </div>
  );
}
