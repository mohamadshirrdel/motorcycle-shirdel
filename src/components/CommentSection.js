'use client';

import { useEffect, useState } from 'react';
import { Star, Send, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/format';

function Stars({ n }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? 'fill-gold text-gold' : 'text-faint'} />
      ))}
    </span>
  );
}

export default function CommentSection({ productId, productTitle, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // اگر کاربر وارد شده باشد، نام را از حسابش پیش‌پر می‌کنیم
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.name && setName((v) => v || d.name))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name: name.trim(), text: text.trim(), rating: Number(rating) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت نظر');
      setMsg({ type: 'ok', text: 'نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.' });
      setName('');
      setText('');
      setRating(5);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-black text-strong"><MessageCircle size={20} className="text-accent" /> دیدگاه مشتریان ({comments.length.toLocaleString('fa-IR')})</h2>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* لیست کامنت‌ها */}
        <div className="space-y-4 lg:col-span-2">
          {comments.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">هنوز دیدگاهی ثبت نشده است؛ اولین نفر شما باشید.</div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel3 text-sm font-black text-gold">{c.name?.[0]}</span>
                    <div>
                      <p className="text-sm font-bold text-strong">{c.name}</p>
                      <p className="text-[10px] text-muted">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <Stars n={c.rating || 5} />
                </div>
                <p className="mt-3 text-sm leading-7 text-soft">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* فرم ثبت دیدگاه */}
        <form onSubmit={submit} className="card h-fit p-5">
          <h3 className="font-black text-strong">دیدگاه شما</h3>
          <p className="mt-1 text-[11px] text-muted">درباره «{productTitle}» نظر دهید؛ پس از تأیید مدیر منتشر می‌شود.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="c-name">نام و نام‌خانوادگی</label>
              <input id="c-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required placeholder="مثلاً: آریا محمدی" />
            </div>
            <div>
              <label className="label">امتیاز شما</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} ستاره`}>
                    <Star size={26} className={i <= rating ? 'fill-gold text-gold transition' : 'text-faint transition hover:text-gold'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="c-text">متن دیدگاه</label>
              <textarea id="c-text" className="input min-h-[110px]" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required placeholder="تجربه‌تان از سواری، شتاب، ترمزها…" />
            </div>
            {msg && (
              <p className={`rounded-xl border px-4 py-2.5 text-xs ${msg.type === 'ok' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>{msg.text}</p>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center"><Send size={16} /> {busy ? 'در حال ثبت…' : 'ثبت دیدگاه'}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
