"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Banknote,
  Lock,
  ShieldCheck,
  Bike,
  BadgeCheck,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, hydrated } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    note: "",
  });
  const [method, setMethod] = useState("online");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState(null);

  // پیش‌پر کردن فرم از حساب کاربر واردشده
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setAccount(d);
        setForm((f) => ({
          ...f,
          name: f.name || d.name || "",
          phone: f.phone || d.phone || "",
          email: f.email || d.email || "",
        }));
      })
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("نام، شماره موبایل و آدرس الزامی است.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
          paymentMethod: method,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ثبت سفارش");
      clearCart();
      router.push(`/checkout/success?code=${encodeURIComponent(data.code)}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-28 text-center">
        <Bike size={44} className="text-muted" />
        <h1 className="text-xl font-black text-strong">سبد شما خالی است</h1>
        <Link href="/bikes" className="btn-primary">
          رفتن به کاتالوگ
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <h1 className="text-2xl font-black text-strong">تکمیل خرید</h1>
      <p className="mt-1 text-sm text-muted">
        اطلاعات ارسال را وارد کنید؛ فاکتور رسمی صادر می‌شود و تیم هماهنگی تحویل
        با شما تماس می‌گیرد.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5"
      >
        {/* فرم اطلاعات */}
        <div className="card space-y-4 p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-black text-strong">اطلاعات گیرنده</h2>
            {account ? (
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[10px] font-bold text-green-500">
                <BadgeCheck size={12} /> سفارش به حساب «{account.name}» وصل
                می‌شود
              </span>
            ) : (
              <Link
                href="/login?next=/checkout"
                className="flex items-center gap-1.5 rounded-full border border-line bg-panel2 px-3 py-1.5 text-[10px] font-bold text-muted transition hover:border-accent hover:text-strong"
              >
                برای ثبت در «حساب من» وارد شوید ←
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                نام و نام‌خانوادگی *
              </label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={set("name")}
                required
                placeholder="آریا محمدی"
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                شماره موبایل * (الزامی)
              </label>
              <input
                id="phone"
                className="input"
                dir="ltr"
                style={{ textAlign: "right" }}
                value={form.phone}
                onChange={set("phone")}
                required
                placeholder="09123456789"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="city">
                شهر
              </label>
              <input
                id="city"
                className="input"
                value={form.city}
                onChange={set("city")}
                placeholder="تربت جام"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="address">
              آدرس کامل پستی *
            </label>
            <textarea
              id="address"
              className="input min-h-[90px]"
              value={form.address}
              onChange={set("address")}
              required
              placeholder="تربت جام، خیابان امام خمینی، …"
            />
          </div>
          <div>
            <label className="label" htmlFor="note">
              توضیحات سفارش (اختیاری)
            </label>
            <textarea
              id="note"
              className="input min-h-[70px]"
              value={form.note}
              onChange={set("note")}
              placeholder="مثلاً: نصب آینه‌های اسپرت + تست سواری قبل از تحویل"
            />
          </div>

          {/* روش پرداخت */}
          <h2 className="pt-2 font-black text-strong">روش پرداخت</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMethod("online")}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition ${method === "online" ? "border-accent bg-accent/10 ring-2 ring-accent/30" : "border-line bg-panel2 hover:border-zinc-600"}`}
            >
              <CreditCard
                size={22}
                className={method === "online" ? "text-accent" : "text-muted"}
              />
              <span>
                <span className="block text-sm font-black text-strong">
                  پرداخت آنلاین
                </span>
                <span className="mt-1 block text-[11px] leading-5 text-muted">
                  درگاه امن زرین‌پال — شبیه‌سازی‌شده، سفارش بلافاصله ثبت می‌شود
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("cod")}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition ${method === "cod" ? "border-accent bg-accent/10 ring-2 ring-accent/30" : "border-line bg-panel2 hover:border-zinc-600"}`}
            >
              <Banknote
                size={22}
                className={method === "cod" ? "text-accent" : "text-muted"}
              />
              <span>
                <span className="block text-sm font-black text-strong">
                  پرداخت هنگام تحویل
                </span>
                <span className="mt-1 block text-[11px] leading-5 text-muted">
                  پس از تحویل و تست نهایی در محل شما
                </span>
              </span>
            </button>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* خلاصه سفارش */}
        <aside className="card h-fit p-6 lg:col-span-2">
          <h2 className="font-black text-strong">خلاصه سفارش</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={i.image}
                  alt={i.title}
                  className="h-14 w-16 rounded-lg bg-stage object-contain p-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-body">{i.title}</span>
                  <span className="text-[10px] text-muted">
                    تعداد: {i.qty.toLocaleString("fa-IR")}
                  </span>
                </span>
                <span className="shrink-0 font-bold text-strong">
                  {formatPrice(i.price * i.qty)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-soft">
            <div className="flex justify-between">
              <dt>ارسال و نصب</dt>
              <dd className="text-green-400">رایگان</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm font-bold text-muted">مبلغ نهایی</span>
            <span className="text-xl font-black text-strong">
              {formatPrice(total)}
            </span>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary mt-5 w-full justify-center text-base"
          >
            {method === "online" ? <Lock size={18} /> : <Banknote size={18} />}
            {busy
              ? "در حال ثبت…"
              : method === "online"
                ? "پرداخت و ثبت سفارش"
                : "ثبت سفارش با پرداخت در محل"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted">
            <ShieldCheck size={12} className="text-green-400" /> اطلاعات شما
            رمزگذاری و محرمانه می‌ماند.
          </p>
        </aside>
      </form>
    </div>
  );
}
