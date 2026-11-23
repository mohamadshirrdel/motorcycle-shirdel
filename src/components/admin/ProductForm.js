'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Save, Star, X } from 'lucide-react';
import { BRANDS, CATEGORIES } from '@/lib/format';

export default function ProductForm({ initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?._id);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    brand: initial?.brand || BRANDS[0],
    category: initial?.category || 'sport',
    price: initial?.price ?? '',
    discountPrice: initial?.discountPrice ?? '',
    stock: initial?.stock ?? 1,
    engine: initial?.engine || '',
    power: initial?.power || '',
    torque: initial?.torque || '',
    weight: initial?.weight || '',
    topSpeed: initial?.topSpeed || '',
    fuelTank: initial?.fuelTank || '',
    warranty: initial?.warranty || 'گارانتی اصالت و سلامت کالا',
    shortDesc: initial?.shortDesc || '',
    description: initial?.description || '',
    colors: (initial?.colors || []).join('، '),
    images: (initial?.images || []).join('\n'),
    featured: Boolean(initial?.featured),
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  // لیست تصاویر فعلی (هر خط یک URL)
  const imageList = String(form.images)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, images: imageList.filter((_, i) => i !== idx).join('\n') }));

  const makeMain = (idx) => {
    const list = [...imageList];
    const [item] = list.splice(idx, 1);
    list.unshift(item);
    setForm((f) => ({ ...f, images: list.join('\n') }));
  };

  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(`۰ از ${files.length}`);
    setError('');
    const uploaded = [];
    let done = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `خطا در آپلود ${file.name}`);
        uploaded.push(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        done += 1;
        setUploadProgress(`${done} از ${files.length}`);
      }
    }
    if (uploaded.length) {
      setForm((f) => ({ ...f, images: [f.images.trim(), ...uploaded].filter(Boolean).join('\n') }));
    }
    setUploading(false);
    setUploadProgress('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      colors: String(form.colors).split(/[،,]/).map((s) => s.trim()).filter(Boolean),
      images: String(form.images).split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${initial._id}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ذخیره');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const Field = ({ label, k, type = 'text', dir }) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} dir={dir} type={type} className="input" value={form[k]} onChange={set(k)} />
    </div>
  );

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* ستون اصلی */}
      <div className="space-y-5 xl:col-span-2">
        <div className="card space-y-4 p-6">
          <h2 className="font-black text-strong">اطلاعات اصلی</h2>
          <div>
            <label className="label" htmlFor="title">عنوان محصول *</label>
            <input id="title" className="input" value={form.title} onChange={set('title')} required placeholder="مثلاً Yamaha YZF-R1 2024" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسلاگ (خودکار ساخته می‌شود)" k="slug" dir="ltr" />
            <div>
              <label className="label" htmlFor="brand">برند *</label>
              <select id="brand" className="input" value={form.brand} onChange={set('brand')}>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value="سایر">سایر</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="shortDesc">توضیح کوتاه</label>
            <input id="shortDesc" className="input" value={form.shortDesc} onChange={set('shortDesc')} maxLength={220} placeholder="یک خط جذاب برای کارت محصول" />
          </div>
          <div>
            <label className="label" htmlFor="description">توضیح کامل</label>
            <textarea id="description" className="input min-h-[140px]" value={form.description} onChange={set('description')} placeholder="درباره عملکرد، هندلینگ، امکانات و مزیت‌های این مدل بنویسید…" />
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-black text-strong">مشخصات فنی</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="حجم موتور" k="engine" />
            <Field label="قدرت" k="power" />
            <Field label="گشتاور" k="torque" />
            <Field label="وزن خشک" k="weight" />
            <Field label="حداکثر سرعت" k="topSpeed" />
            <Field label="حجم باک" k="fuelTank" />
          </div>
          <Field label="گارانتی و خدمات پس از فروش" k="warranty" />
          <div>
            <label className="label" htmlFor="colors">رنگ‌های موجود (با ویرگول جدا کنید)</label>
            <input id="colors" className="input" value={form.colors} onChange={set('colors')} placeholder="مشکی مات، قرمز ریسینگ، آبی…" />
          </div>
        </div>
      </div>

      {/* ستون کناری */}
      <div className="space-y-5">
        <div className="card space-y-4 p-6">
          <h2 className="font-black text-strong">قیمت و موجودی</h2>
          <div>
            <label className="label" htmlFor="price">قیمت (تومان) *</label>
            <input id="price" type="number" min="0" className="input" dir="ltr" style={{ textAlign: 'left' }} value={form.price} onChange={set('price')} required />
          </div>
          <div>
            <label className="label" htmlFor="discountPrice">قیمت با تخفیف (اختیاری)</label>
            <input id="discountPrice" type="number" min="0" className="input" dir="ltr" style={{ textAlign: 'left' }} value={form.discountPrice} onChange={set('discountPrice')} />
          </div>
          <div>
            <label className="label" htmlFor="stock">موجودی (دستگاه)</label>
            <input id="stock" type="number" min="0" className="input" value={form.stock} onChange={set('stock')} />
          </div>
          <div>
            <label className="label" htmlFor="category">دسته‌بندی</label>
            <select id="category" className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <span className="flex items-center gap-2 text-xs font-bold text-gold"><Star size={15} /> نمایش در «پیشنهاد ویژه» صفحه اول</span>
            <input type="checkbox" className="h-5 w-5 accent-[#E10600]" checked={form.featured} onChange={set('featured')} />
          </label>
        </div>

        <div className="card space-y-3 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-strong">تصاویر</h2>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-body transition hover:border-accent">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {uploading ? `آپلود… ${uploadProgress}` : 'آپلود چند تصویر'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={uploadImages} />
          </div>

          {imageList.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {imageList.map((src, i) => (
                <div key={`${src}-${i}`} className={`group relative overflow-hidden rounded-xl border bg-stage ${i === 0 ? 'border-accent ring-2 ring-accent/40' : 'border-line'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`تصویر ${i + 1}`} className="h-20 w-full object-contain p-1.5" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/65 px-1.5 py-1 backdrop-blur-sm">
                    {i === 0 ? (
                      <span className="text-[9px] font-black text-gold">★ تصویر اصلی</span>
                    ) : (
                      <button type="button" onClick={() => makeMain(i)} className="text-[9px] font-bold text-white/90 transition hover:text-gold">اصلی کن</button>
                    )}
                    <button type="button" onClick={() => removeImage(i)} className="rounded p-0.5 text-white/80 transition hover:text-red-400" aria-label="حذف تصویر"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] leading-5 text-muted">با دکمه «آپلود چند تصویر» می‌توانید چند فایل را با هم انتخاب کنید؛ تصویر اول «تصویر اصلی» است و در کارت محصول و اسلایدر صفحه محصول نمایش داده می‌شود.</p>
          <textarea dir="ltr" style={{ textAlign: 'left' }} className="input min-h-[110px] font-mono text-[11px]" value={form.images} onChange={set('images')} placeholder="/images/bikes/yamaha-r1.webp" />
        </div>

        {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="btn-primary flex-1 justify-center">{busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {isEdit ? 'ذخیره تغییرات' : 'ثبت محصول'}</button>
          <button type="button" onClick={() => router.back()} className="btn-ghost !px-5">انصراف</button>
        </div>
      </div>
    </form>
  );
}
